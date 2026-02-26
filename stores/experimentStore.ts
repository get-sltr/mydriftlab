/**
 * Experiment Store — Zustand + SecureStore
 * Manages remedy experiment lifecycle: pick → baseline → log → compare.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import type {
  Experiment,
  Remedy,
  ExperimentLog,
  ExperimentResults,
  ExperimentAdherence,
} from '../lib/types';

const STORE_KEY = 'driftlab_experiments';

interface StoredExperiments {
  active: ExperimentWithLogs | null;
  past: ExperimentWithLogs[];
}

export interface ExperimentWithLogs extends Experiment {
  remedyId: string;
  logs: ExperimentLog[];
  baselineScores: number[];
  baselineBdi: number[];
  baselineEfficiency: number[];
}

interface ExperimentState {
  activeExperiment: ExperimentWithLogs | null;
  pastExperiments: ExperimentWithLogs[];
  isLoading: boolean;

  initialize: () => Promise<void>;
  startExperiment: (
    userId: string,
    remedy: Remedy,
    baselineScores: number[],
    baselineBdi?: number[],
    baselineEfficiency?: number[],
  ) => Promise<void>;
  logDay: (
    adherence: ExperimentAdherence,
    notes: string,
    restScore: number | null,
    bdi: number | null,
    sleepEfficiency: number | null,
  ) => Promise<void>;
  completeExperiment: () => Promise<ExperimentResults | null>;
  abandonExperiment: () => Promise<void>;
  getResults: (experiment: ExperimentWithLogs) => ExperimentResults;
}

export const useExperimentStore = create<ExperimentState>((set, get) => ({
  activeExperiment: null,
  pastExperiments: [],
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const stored = await SecureStore.getItemAsync(STORE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as StoredExperiments;
        set({
          activeExperiment: data.active,
          pastExperiments: data.past ?? [],
        });
      }
    } catch {
      // No stored data
    } finally {
      set({ isLoading: false });
    }
  },

  startExperiment: async (
    userId,
    remedy,
    baselineScores,
    baselineBdi = [],
    baselineEfficiency = [],
  ) => {
    const id = `exp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const baselineAvg =
      baselineScores.length > 0
        ? baselineScores.reduce((s, v) => s + v, 0) / baselineScores.length
        : 0;

    const experiment: ExperimentWithLogs = {
      id,
      userId,
      name: remedy.name,
      hypothesis: `${remedy.name} will improve sleep quality`,
      targetMetric: remedy.targetMetrics[0] ?? 'restScore',
      baselineValue: Math.round(baselineAvg),
      currentValue: null,
      totalNights: remedy.experimentDuration,
      completedNights: 0,
      status: 'active',
      improvementPct: null,
      resultSummary: null,
      startedAt: new Date().toISOString(),
      completedAt: null,
      remedyId: remedy.id,
      logs: [],
      baselineScores,
      baselineBdi,
      baselineEfficiency,
    };

    set({ activeExperiment: experiment });
    await persist(get());
  },

  logDay: async (adherence, notes, restScore, bdi, sleepEfficiency) => {
    const { activeExperiment } = get();
    if (!activeExperiment) return;

    const log: ExperimentLog = {
      date: new Date().toISOString().split('T')[0],
      adherence,
      notes,
      restScore,
      bdi,
      sleepEfficiency,
    };

    const updated: ExperimentWithLogs = {
      ...activeExperiment,
      logs: [...activeExperiment.logs, log],
      completedNights: activeExperiment.completedNights + 1,
    };

    // Update current value from latest score
    if (restScore !== null) {
      const scored = updated.logs.filter((l) => l.restScore !== null);
      updated.currentValue = Math.round(
        scored.reduce((s, l) => s + l.restScore!, 0) / scored.length,
      );
    }

    set({ activeExperiment: updated });
    await persist(get());
  },

  completeExperiment: async () => {
    const { activeExperiment, pastExperiments } = get();
    if (!activeExperiment) return null;

    const results = get().getResults(activeExperiment);

    const completed: ExperimentWithLogs = {
      ...activeExperiment,
      status: 'complete',
      completedAt: new Date().toISOString(),
      improvementPct: results.improvementPct,
      resultSummary: buildResultSummary(activeExperiment.name, results),
    };

    set({
      activeExperiment: null,
      pastExperiments: [completed, ...pastExperiments],
    });
    await persist(get());

    return results;
  },

  abandonExperiment: async () => {
    const { activeExperiment, pastExperiments } = get();
    if (!activeExperiment) return;

    const abandoned: ExperimentWithLogs = {
      ...activeExperiment,
      status: 'abandoned',
      completedAt: new Date().toISOString(),
      resultSummary: 'Experiment abandoned before completion.',
    };

    set({
      activeExperiment: null,
      pastExperiments: [abandoned, ...pastExperiments],
    });
    await persist(get());
  },

  getResults: (experiment) => {
    const baselineAvg =
      experiment.baselineScores.length > 0
        ? experiment.baselineScores.reduce((s, v) => s + v, 0) /
          experiment.baselineScores.length
        : 0;

    const expScores = experiment.logs
      .filter((l) => l.restScore !== null)
      .map((l) => l.restScore!);
    const expAvg =
      expScores.length > 0
        ? expScores.reduce((s, v) => s + v, 0) / expScores.length
        : 0;

    const expBdi = experiment.logs
      .filter((l) => l.bdi !== null)
      .map((l) => l.bdi!);
    const baselineBdiAvg =
      experiment.baselineBdi.length > 0
        ? experiment.baselineBdi.reduce((s, v) => s + v, 0) /
          experiment.baselineBdi.length
        : null;
    const expBdiAvg =
      expBdi.length > 0
        ? expBdi.reduce((s, v) => s + v, 0) / expBdi.length
        : null;

    const expEff = experiment.logs
      .filter((l) => l.sleepEfficiency !== null)
      .map((l) => l.sleepEfficiency!);
    const baselineEffAvg =
      experiment.baselineEfficiency.length > 0
        ? experiment.baselineEfficiency.reduce((s, v) => s + v, 0) /
          experiment.baselineEfficiency.length
        : null;
    const expEffAvg =
      expEff.length > 0
        ? expEff.reduce((s, v) => s + v, 0) / expEff.length
        : null;

    const improvementPct =
      baselineAvg > 0
        ? Math.round(((expAvg - baselineAvg) / baselineAvg) * 100)
        : 0;

    let verdict: 'improved' | 'no_change' | 'worsened';
    if (improvementPct > 5) verdict = 'improved';
    else if (improvementPct < -5) verdict = 'worsened';
    else verdict = 'no_change';

    return {
      baselineAvgScore: Math.round(baselineAvg),
      experimentAvgScore: Math.round(expAvg),
      baselineAvgBdi: baselineBdiAvg !== null ? Math.round(baselineBdiAvg * 10) / 10 : null,
      experimentAvgBdi: expBdiAvg !== null ? Math.round(expBdiAvg * 10) / 10 : null,
      baselineAvgEfficiency: baselineEffAvg !== null ? Math.round(baselineEffAvg) : null,
      experimentAvgEfficiency: expEffAvg !== null ? Math.round(expEffAvg) : null,
      verdict,
      improvementPct,
    };
  },
}));

// ── Helpers ──────────────────────────────────────────────────

async function persist(state: ExperimentState): Promise<void> {
  try {
    const data: StoredExperiments = {
      active: state.activeExperiment,
      past: state.pastExperiments,
    };
    await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(data));
  } catch {
    // Storage failure
  }
}

function buildResultSummary(name: string, results: ExperimentResults): string {
  const { verdict, improvementPct, baselineAvgScore, experimentAvgScore } =
    results;

  if (verdict === 'improved') {
    return `${name} improved your rest score by ${improvementPct}% (${baselineAvgScore} → ${experimentAvgScore}).`;
  }
  if (verdict === 'worsened') {
    return `${name} didn't help — your rest score decreased by ${Math.abs(improvementPct)}% (${baselineAvgScore} → ${experimentAvgScore}).`;
  }
  return `${name} showed no significant change (${baselineAvgScore} → ${experimentAvgScore}).`;
}
