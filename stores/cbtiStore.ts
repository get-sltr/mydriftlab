/**
 * CBT-I Store — Zustand + file-based persistence
 * Manages the 6-week Insomnia Fighter program state and sleep diary.
 *
 * Uses expo-file-system instead of SecureStore because diary entries
 * can grow well beyond SecureStore's ~2KB value limit.
 */

import { create } from 'zustand';
import { Paths, File } from 'expo-file-system';
import type { CBTIProgram, SleepDiaryEntry } from '../lib/types';
import {
  createProgram,
  calculateBaseline,
  setInitialRestriction,
  advanceWeek,
  calculateDiaryEntry,
  getWeeklyProgress as getProgress,
} from '../services/cbti/programEngine';

const STORE_FILENAME = 'cbti_program.json';

function getStoreFile(): File {
  return new File(Paths.document, STORE_FILENAME);
}

interface CBTIState {
  program: CBTIProgram | null;
  isLoading: boolean;

  initialize: () => Promise<void>;
  startProgram: (userId: string, wakeTime?: string) => Promise<void>;
  submitDiaryEntry: (
    entry: Omit<SleepDiaryEntry, 'timeInBed' | 'totalSleepTime' | 'efficiency'>,
  ) => Promise<void>;
  checkWeekAdvancement: () => void;
  getPrescription: () => {
    bedtime: string;
    wakeTime: string;
    timeInBedMinutes: number;
  };
  getWeeklyProgress: () => {
    efficiency: number;
    adherence: number;
    trend: 'improving' | 'stable' | 'declining';
  };
  completeProgram: () => Promise<void>;
  pauseProgram: () => Promise<void>;
  resumeProgram: () => Promise<void>;
  abandonProgram: () => Promise<void>;
}

export const useCBTIStore = create<CBTIState>((set, get) => ({
  program: null,
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const file = getStoreFile();
      if (file.exists) {
        const raw = await file.text();
        const program = JSON.parse(raw) as CBTIProgram;
        set({ program });
      }
    } catch {
      // No stored program or corrupt data
    } finally {
      set({ isLoading: false });
    }
  },

  startProgram: async (userId, wakeTime) => {
    const program = createProgram(userId, wakeTime);
    set({ program });
    await persistProgram(program);
  },

  submitDiaryEntry: async (partial) => {
    const { program } = get();
    if (!program) return;

    const entry = calculateDiaryEntry(partial);

    const updated: CBTIProgram = {
      ...program,
      sleepDiary: [...program.sleepDiary, entry],
    };

    // After baseline week (7 entries), calculate initial restriction
    if (
      program.currentWeek === 1 &&
      updated.sleepDiary.length >= 7 &&
      program.baselineSleepEfficiency === 0
    ) {
      const baseline = calculateBaseline(updated.sleepDiary);
      const restricted = setInitialRestriction(updated, baseline.avgSleepMinutes);
      restricted.baselineSleepEfficiency = baseline.avgEfficiency;
      restricted.currentSleepEfficiency = baseline.avgEfficiency;
      set({ program: restricted });
      await persistProgram(restricted);
      return;
    }

    set({ program: updated });
    await persistProgram(updated);
  },

  checkWeekAdvancement: () => {
    const { program } = get();
    if (!program || program.status !== 'active') return;

    // Check if a week has passed since program start
    const startDate = new Date(program.startedAt);
    const now = new Date();
    const daysSinceStart = Math.floor(
      (now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    );
    const expectedWeek = Math.min(6, Math.floor(daysSinceStart / 7) + 1);

    if (expectedWeek > program.currentWeek) {
      // Calculate this week's efficiency from recent diary entries
      const weekEntries = program.sleepDiary.slice(-7);
      const weekEff =
        weekEntries.length > 0
          ? weekEntries.reduce((s, e) => s + e.efficiency, 0) / weekEntries.length
          : program.currentSleepEfficiency;

      const advanced = advanceWeek(program, Math.round(weekEff));
      set({ program: advanced });
      persistProgram(advanced);
    }
  },

  getPrescription: () => {
    const { program } = get();
    if (!program) {
      return { bedtime: '23:00', wakeTime: '06:30', timeInBedMinutes: 450 };
    }
    return {
      bedtime: program.prescribedBedtime,
      wakeTime: program.prescribedWakeTime,
      timeInBedMinutes: program.timeInBedMinutes,
    };
  },

  getWeeklyProgress: () => {
    const { program } = get();
    if (!program || program.sleepDiary.length === 0) {
      return { efficiency: 0, adherence: 0, trend: 'stable' as const };
    }
    return getProgress(program.sleepDiary, program.currentWeek);
  },

  completeProgram: async () => {
    const { program } = get();
    if (!program) return;
    const updated = { ...program, status: 'completed' as const };
    set({ program: updated });
    await persistProgram(updated);
  },

  pauseProgram: async () => {
    const { program } = get();
    if (!program) return;
    const updated = { ...program, status: 'paused' as const };
    set({ program: updated });
    await persistProgram(updated);
  },

  resumeProgram: async () => {
    const { program } = get();
    if (!program || program.status !== 'paused') return;
    const updated = { ...program, status: 'active' as const };
    set({ program: updated });
    await persistProgram(updated);
  },

  abandonProgram: async () => {
    const { program } = get();
    if (!program) return;
    const updated = { ...program, status: 'abandoned' as const };
    set({ program: updated });
    await persistProgram(updated);
  },
}));

async function persistProgram(program: CBTIProgram): Promise<void> {
  try {
    const file = getStoreFile();
    file.create({ intermediates: true, overwrite: true });
    file.write(JSON.stringify(program));
  } catch {
    // Storage failure — non-critical
  }
}
