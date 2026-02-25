/**
 * Phase 1 rule-based audio event classification
 * Stateful detection engine with 3 detectors:
 *   1. SpikeDetector: loud events (>20dB above baseline for >2s)
 *   2. SustainedDetector: sustained noise (>10dB above baseline for >30s)
 *   3. SnoringDetector: rhythmic peaks at 3-8s intervals
 *
 * Cooldown: 120s between same-type events to prevent spam.
 * Sensitivity presets map to UserPreferences.sensitivityLevel.
 */

import type { EnvironmentEvent } from '../../lib/types';
import type { AudioLevel } from './recorder';

interface SensitivityConfig {
  spikeThresholdDb: number;
  sustainedThresholdDb: number;
  snoringThresholdDb: number;
}

const SENSITIVITY: Record<string, SensitivityConfig> = {
  low: { spikeThresholdDb: 25, sustainedThresholdDb: 15, snoringThresholdDb: 12 },
  medium: { spikeThresholdDb: 20, sustainedThresholdDb: 10, snoringThresholdDb: 8 },
  high: { spikeThresholdDb: 15, sustainedThresholdDb: 7, snoringThresholdDb: 5 },
};

const COOLDOWN_MS = 120_000; // 2 min between same-type events
const SPIKE_MIN_DURATION_MS = 2000;
const SUSTAINED_MIN_DURATION_MS = 30_000;
const SNORING_MIN_CYCLES = 4;
const SNORING_CYCLE_MIN_S = 3;
const SNORING_CYCLE_MAX_S = 8;
const SNORING_STD_DEV_MAX_S = 1.5;

export class RuleEngine {
  private sensitivity: SensitivityConfig;
  private lastEventTime: Record<string, number> = {};

  // Spike state
  private spikeStartTime: number | null = null;

  // Sustained state
  private sustainedStartTime: number | null = null;

  // Snoring state — tracks timestamps of peaks above threshold
  private snoringPeaks: number[] = [];
  private lastPeakTime = 0;
  private wasAboveSnoringThreshold = false;

  constructor(sensitivityLevel: 'low' | 'medium' | 'high' = 'medium') {
    this.sensitivity = SENSITIVITY[sensitivityLevel];
  }

  /**
   * Analyze recent audio levels against baseline.
   * Call at ~1Hz with the last 30s of audio data.
   * Returns detected events (may be empty).
   */
  analyze(
    recentLevels: AudioLevel[],
    baselineDb: number,
    sessionId: string,
  ): Partial<EnvironmentEvent>[] {
    if (recentLevels.length === 0) return [];

    const events: Partial<EnvironmentEvent>[] = [];
    const now = Date.now();
    const currentDb = recentLevels[0].splDb; // Most recent (getLast returns newest first)

    // --- Spike detection ---
    const spikeEvent = this.detectSpike(currentDb, baselineDb, now, sessionId);
    if (spikeEvent) events.push(spikeEvent);

    // --- Sustained noise detection ---
    const sustainedEvent = this.detectSustained(currentDb, baselineDb, now, sessionId);
    if (sustainedEvent) events.push(sustainedEvent);

    // --- Snoring detection ---
    const snoringEvent = this.detectSnoring(currentDb, baselineDb, now, sessionId);
    if (snoringEvent) events.push(snoringEvent);

    return events;
  }

  private detectSpike(
    currentDb: number,
    baselineDb: number,
    now: number,
    sessionId: string,
  ): Partial<EnvironmentEvent> | null {
    const aboveThreshold = currentDb > baselineDb + this.sensitivity.spikeThresholdDb;

    if (aboveThreshold) {
      if (this.spikeStartTime === null) {
        this.spikeStartTime = now;
      }

      const duration = now - this.spikeStartTime;
      if (duration >= SPIKE_MIN_DURATION_MS && this.canEmit('loud_event', now)) {
        this.spikeStartTime = null;
        this.lastEventTime['loud_event'] = now;

        const delta = currentDb - baselineDb;
        const severity = delta >= 40 ? 'high' : delta >= 25 ? 'medium' : 'low';

        return {
          sessionId,
          timestamp: new Date(now).toISOString(),
          category: 'noise',
          type: 'loud_event',
          severity,
          durationSeconds: Math.round(duration / 1000),
          decibelLevel: currentDb,
          confidence: Math.min(0.95, 0.6 + delta * 0.01),
        };
      }
    } else {
      this.spikeStartTime = null;
    }

    return null;
  }

  private detectSustained(
    currentDb: number,
    baselineDb: number,
    now: number,
    sessionId: string,
  ): Partial<EnvironmentEvent> | null {
    const aboveThreshold = currentDb > baselineDb + this.sensitivity.sustainedThresholdDb;

    if (aboveThreshold) {
      if (this.sustainedStartTime === null) {
        this.sustainedStartTime = now;
      }

      const duration = now - this.sustainedStartTime;
      if (duration >= SUSTAINED_MIN_DURATION_MS && this.canEmit('sustained_noise', now)) {
        this.sustainedStartTime = null;
        this.lastEventTime['sustained_noise'] = now;

        return {
          sessionId,
          timestamp: new Date(now).toISOString(),
          category: 'noise',
          type: 'sustained_noise',
          severity: 'medium',
          durationSeconds: Math.round(duration / 1000),
          decibelLevel: currentDb,
          confidence: 0.75,
        };
      }
    } else {
      this.sustainedStartTime = null;
    }

    return null;
  }

  private detectSnoring(
    currentDb: number,
    baselineDb: number,
    now: number,
    sessionId: string,
  ): Partial<EnvironmentEvent> | null {
    const aboveThreshold = currentDb > baselineDb + this.sensitivity.snoringThresholdDb;

    // Detect peaks (transitions from below to above threshold)
    if (aboveThreshold && !this.wasAboveSnoringThreshold) {
      // New peak detected
      if (now - this.lastPeakTime > 1000) {
        // Ignore peaks less than 1s apart (noise)
        this.snoringPeaks.push(now);
        this.lastPeakTime = now;

        // Keep only last 10 peaks
        if (this.snoringPeaks.length > 10) {
          this.snoringPeaks = this.snoringPeaks.slice(-10);
        }
      }
    }
    this.wasAboveSnoringThreshold = aboveThreshold;

    // Check for rhythmic pattern
    if (this.snoringPeaks.length >= SNORING_MIN_CYCLES && this.canEmit('snoring', now)) {
      const intervals: number[] = [];
      for (let i = 1; i < this.snoringPeaks.length; i++) {
        intervals.push((this.snoringPeaks[i] - this.snoringPeaks[i - 1]) / 1000);
      }

      // Check intervals are in snoring range (3-8s)
      const allInRange = intervals.every(
        (int) => int >= SNORING_CYCLE_MIN_S && int <= SNORING_CYCLE_MAX_S,
      );

      if (allInRange) {
        // Check standard deviation < 1.5s (rhythmic)
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance =
          intervals.reduce((sum, int) => sum + (int - mean) ** 2, 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        if (stdDev < SNORING_STD_DEV_MAX_S) {
          this.lastEventTime['snoring'] = now;
          const totalDuration = (this.snoringPeaks[this.snoringPeaks.length - 1] - this.snoringPeaks[0]) / 1000;
          this.snoringPeaks = [];

          return {
            sessionId,
            timestamp: new Date(now).toISOString(),
            category: 'noise',
            type: 'snoring',
            severity: totalDuration > 60 ? 'high' : totalDuration > 20 ? 'medium' : 'low',
            durationSeconds: Math.round(totalDuration),
            decibelLevel: currentDb,
            confidence: Math.min(0.9, 0.5 + (1 - stdDev / SNORING_STD_DEV_MAX_S) * 0.4),
          };
        }
      }
    }

    // Expire old peaks (>30s old)
    const cutoff = now - 30_000;
    this.snoringPeaks = this.snoringPeaks.filter((t) => t > cutoff);

    return null;
  }

  private canEmit(type: string, now: number): boolean {
    const lastTime = this.lastEventTime[type];
    return !lastTime || now - lastTime >= COOLDOWN_MS;
  }

  reset(): void {
    this.lastEventTime = {};
    this.spikeStartTime = null;
    this.sustainedStartTime = null;
    this.snoringPeaks = [];
    this.lastPeakTime = 0;
    this.wasAboveSnoringThreshold = false;
  }
}
