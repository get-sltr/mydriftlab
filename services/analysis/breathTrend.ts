/**
 * BreathTrend Analyzer — continuous overnight breathing analysis.
 *
 * Receives the same 10Hz metering stream used by BreathingMonitor.
 * Analyzes in 60-second windows to produce per-window BreathingSnapshots,
 * then accumulates into a full-night BreathTrendSummary with BDI.
 *
 * BDI (Breathing Disturbance Index) counts irregularities per hour:
 *   - Gap >10s between breaths
 *   - Regularity <0.2 for >15s
 *   - Rate change >6 BPM within 60s
 * Scale: 0–5 normal, 5–15 mild, 15–30 moderate, 30+ severe (mirrors AHI)
 *
 * DISCLAIMER: BDI is an estimate from audio analysis, not a medical diagnosis.
 */

import {
  zeroMeanNormalize,
  movingAverage,
  autocorrelate,
  lagToBpm,
} from '../audio/dsp';
import type {
  BreathingSnapshot,
  BreathTrendSummary,
  BreathingPhase,
} from '../../lib/types';

// ── Config ───────────────────────────────────────────────────

const SAMPLE_RATE_HZ = 10;
const WINDOW_SECONDS = 60;
const SAMPLES_PER_WINDOW = WINDOW_SECONDS * SAMPLE_RATE_HZ; // 600

// Breathing BPM search range: 6–30 BPM → lags 20–100 at 10 Hz
const MIN_LAG = Math.floor((SAMPLE_RATE_HZ * 60) / 30); // 20
const MAX_LAG = Math.ceil((SAMPLE_RATE_HZ * 60) / 6);   // 100

// Disturbance thresholds
const BREATH_GAP_THRESHOLD_S = 10;
const LOW_REGULARITY_THRESHOLD = 0.2;
const LOW_REGULARITY_DURATION_S = 15;
const RATE_CHANGE_THRESHOLD_BPM = 6;

// ── Class ────────────────────────────────────────────────────

export class BreathTrendAnalyzer {
  private meteringBuffer: number[] = [];
  private snapshots: BreathingSnapshot[] = [];
  private startTime: Date | null = null;
  private windowCount = 0;

  // Disturbance tracking across windows
  private lowRegularityStartSample = -1;
  private lastRate = 0;
  private disturbanceCount = 0;
  private disturbanceSamples = 0;

  /** Feed a single metering value (dB level at 10 Hz). */
  pushSample(db: number): void {
    if (!this.startTime) this.startTime = new Date();
    this.meteringBuffer.push(db);

    if (this.meteringBuffer.length >= SAMPLES_PER_WINDOW) {
      this.analyzeWindow();
      // Keep 10% overlap for continuity
      this.meteringBuffer = this.meteringBuffer.slice(
        Math.floor(SAMPLES_PER_WINDOW * 0.9),
      );
    }
  }

  /** Get the most recent breathing rate (BPM) from the latest snapshot. */
  getLatestBreathingRate(): number {
    if (this.snapshots.length === 0) return 0;
    return this.snapshots[this.snapshots.length - 1].breathingRate;
  }

  /** Finalize and return the full-night summary. */
  finalize(): BreathTrendSummary {
    // Analyze any remaining data if we have at least 50% of a window
    if (this.meteringBuffer.length >= SAMPLES_PER_WINDOW * 0.5) {
      this.analyzeWindow();
    }

    return this.buildSummary();
  }

  /** Get snapshots collected so far (for real-time display). */
  getSnapshots(): BreathingSnapshot[] {
    return [...this.snapshots];
  }

  // ── Private ──────────────────────────────────────────────

  private analyzeWindow(): void {
    this.windowCount++;

    const raw = this.meteringBuffer.slice(0, SAMPLES_PER_WINDOW);
    const centered = zeroMeanNormalize(raw);
    const smoothed = movingAverage(centered, 5);

    // Find breathing rate
    const { bestLag, strength } = autocorrelate(smoothed, MIN_LAG, MAX_LAG);
    const breathingRate = lagToBpm(bestLag, SAMPLE_RATE_HZ);
    const regularity = strength;

    // Average amplitude (RMS of raw dB values — proxy for signal strength)
    const rms = Math.sqrt(raw.reduce((s, v) => s + v * v, 0) / raw.length);

    // Disturbance detection
    let disturbance = false;

    // 1. Check for breath gaps (rate drops to 0 or extremely low)
    if (breathingRate > 0 && breathingRate < 6) {
      disturbance = true;
      this.disturbanceCount++;
    }

    // 2. Check low regularity sustained >15s
    if (regularity < LOW_REGULARITY_THRESHOLD) {
      if (this.lowRegularityStartSample < 0) {
        this.lowRegularityStartSample = this.windowCount * SAMPLES_PER_WINDOW;
      }
      const durationSamples =
        this.windowCount * SAMPLES_PER_WINDOW - this.lowRegularityStartSample;
      if (durationSamples / SAMPLE_RATE_HZ > LOW_REGULARITY_DURATION_S) {
        disturbance = true;
        this.disturbanceCount++;
      }
    } else {
      this.lowRegularityStartSample = -1;
    }

    // 3. Rate change >6 BPM within a window
    if (this.lastRate > 0 && breathingRate > 0) {
      if (Math.abs(breathingRate - this.lastRate) > RATE_CHANGE_THRESHOLD_BPM) {
        disturbance = true;
        this.disturbanceCount++;
      }
    }
    this.lastRate = breathingRate;

    if (disturbance) {
      this.disturbanceSamples += SAMPLES_PER_WINDOW;
    }

    const now = new Date();
    const snapshot: BreathingSnapshot = {
      timestamp: now.toISOString(),
      breathingRate: Math.round(breathingRate * 10) / 10,
      regularity: Math.round(regularity * 100) / 100,
      avgAmplitude: Math.round(rms * 10) / 10,
      disturbanceDetected: disturbance,
    };

    this.snapshots.push(snapshot);
  }

  private buildSummary(): BreathTrendSummary {
    const validSnapshots = this.snapshots.filter((s) => s.breathingRate > 0);

    if (validSnapshots.length === 0) {
      return {
        avgBreathingRate: 0,
        minBreathingRate: 0,
        maxBreathingRate: 0,
        avgRegularity: 0,
        disturbanceCount: 0,
        disturbanceMinutes: 0,
        bdi: 0,
        bdiSeverity: 'normal',
        recordingHours: 0,
        phases: [],
        snapshots: this.snapshots,
      };
    }

    const rates = validSnapshots.map((s) => s.breathingRate);
    const avgRate = rates.reduce((a, b) => a + b, 0) / rates.length;
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    const avgReg =
      validSnapshots.reduce((s, snap) => s + snap.regularity, 0) /
      validSnapshots.length;

    const totalMinutes = (this.windowCount * WINDOW_SECONDS) / 60;
    const recordingHours = totalMinutes / 60;
    const disturbanceMinutes = (this.disturbanceSamples / SAMPLE_RATE_HZ) / 60;

    // BDI = disturbances per hour
    const bdi = recordingHours > 0
      ? Math.round((this.disturbanceCount / recordingHours) * 10) / 10
      : 0;

    const bdiSeverity = getBdiSeverity(bdi);

    // Build phases from snapshots
    const phases = this.buildPhases();

    return {
      avgBreathingRate: Math.round(avgRate * 10) / 10,
      minBreathingRate: Math.round(minRate * 10) / 10,
      maxBreathingRate: Math.round(maxRate * 10) / 10,
      avgRegularity: Math.round(avgReg * 100) / 100,
      disturbanceCount: this.disturbanceCount,
      disturbanceMinutes: Math.round(disturbanceMinutes),
      bdi,
      bdiSeverity,
      recordingHours: Math.round(recordingHours * 10) / 10,
      phases,
      snapshots: this.snapshots,
    };
  }

  private buildPhases(): {
    phase: BreathingPhase;
    startTime: string;
    endTime: string;
  }[] {
    if (this.snapshots.length === 0) return [];

    const phases: { phase: BreathingPhase; startTime: string; endTime: string }[] = [];
    let currentPhase = classifyPhase(this.snapshots[0]);
    let phaseStart = this.snapshots[0].timestamp;

    for (let i = 1; i < this.snapshots.length; i++) {
      const snap = this.snapshots[i];
      const phase = classifyPhase(snap);

      if (phase !== currentPhase) {
        phases.push({
          phase: currentPhase,
          startTime: phaseStart,
          endTime: snap.timestamp,
        });
        currentPhase = phase;
        phaseStart = snap.timestamp;
      }
    }

    // Close last phase
    phases.push({
      phase: currentPhase,
      startTime: phaseStart,
      endTime: this.snapshots[this.snapshots.length - 1].timestamp,
    });

    return phases;
  }
}

// ── Helpers ──────────────────────────────────────────────────

function classifyPhase(snap: BreathingSnapshot): BreathingPhase {
  if (snap.disturbanceDetected) return 'disturbed';
  if (snap.regularity > 0.5 && snap.breathingRate < 16) return 'quiet';
  return 'active';
}

export function getBdiSeverity(
  bdi: number,
): 'normal' | 'mild' | 'moderate' | 'severe' {
  if (bdi < 5) return 'normal';
  if (bdi < 15) return 'mild';
  if (bdi < 30) return 'moderate';
  return 'severe';
}
