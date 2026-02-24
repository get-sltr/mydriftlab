/**
 * Phase 1 rule-based audio event classification
 * Simple heuristics: volume thresholds + duration patterns
 */

import { EnvironmentEvent } from '../../lib/types';

export interface RuleEngineConfig {
  spikeThresholdDb: number;      // dB above baseline for spike detection
  spikeMinDurationSec: number;   // minimum duration for spike event
  sustainedThresholdDb: number;  // dB above baseline for sustained noise
  sustainedMinDurationSec: number;
  snoringCycleMinSec: number;    // rhythmic peaks every N seconds
  snoringCycleMaxSec: number;
}

export const defaultConfig: RuleEngineConfig = {
  spikeThresholdDb: 20,
  spikeMinDurationSec: 2,
  sustainedThresholdDb: 10,
  sustainedMinDurationSec: 30,
  snoringCycleMinSec: 3,
  snoringCycleMaxSec: 8,
};

// Placeholder - full implementation in Step 6
export function classifyEvent(
  _dbLevel: number,
  _baselineDb: number,
  _durationSec: number,
): Partial<EnvironmentEvent> | null {
  return null;
}
