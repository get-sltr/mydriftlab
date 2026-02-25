/**
 * Smart Fade - sleep onset detection
 * Detects when user falls asleep and triggers progressive dimming.
 * Pure functions — no class, no side effects.
 *
 * Triggers when:
 *   - No interaction for >= 15 min
 *   - Current dB <= baseline + 5dB (quiet environment)
 */

export interface SmartFadeState {
  lastInteractionAt: number;
  triggered: boolean;
}

const INACTIVITY_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes
const QUIET_THRESHOLD_DB = 5; // dB above baseline

export function createSmartFadeState(): SmartFadeState {
  return {
    lastInteractionAt: Date.now(),
    triggered: false,
  };
}

/**
 * Check if smart fade should trigger.
 * Returns true once when conditions are first met.
 */
export function checkSmartFade(
  state: SmartFadeState,
  currentDb: number,
  baselineDb: number,
): boolean {
  if (state.triggered) return false;

  const inactiveDuration = Date.now() - state.lastInteractionAt;
  const isInactive = inactiveDuration >= INACTIVITY_THRESHOLD_MS;
  const isQuiet = currentDb <= baselineDb + QUIET_THRESHOLD_DB;

  if (isInactive && isQuiet) {
    state.triggered = true;
    return true;
  }

  return false;
}

/** Record a user interaction (resets inactivity timer) */
export function recordInteraction(state: SmartFadeState): void {
  state.lastInteractionAt = Date.now();
  state.triggered = false;
}
