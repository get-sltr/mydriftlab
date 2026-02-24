/**
 * Rest Score calculation
 * Phase 1: Simple weighted sum of disruptions
 *
 * Start at 100, deduct for each disruption:
 * - Noise event: -3 to -10 based on dB and duration
 * - Temp deviation from 65-68F: -2 to -5
 * - Light intrusion: -2 to -4
 * - Routine completion bonus: +5
 * Floor at 0, cap at 100
 */

import { EnvironmentEvent } from '../../lib/types';

export function calculateRestScore(
  events: EnvironmentEvent[],
  windDownCompleted: boolean,
): number {
  let score = 100;

  for (const event of events) {
    switch (event.category) {
      case 'noise':
        score -= calculateNoiseDeduction(event);
        break;
      case 'climate':
        score -= calculateClimateDeduction(event);
        break;
      case 'light':
        score -= calculateLightDeduction(event);
        break;
      case 'partner':
        score -= 2;
        break;
    }
  }

  if (windDownCompleted) {
    score += 5;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateNoiseDeduction(event: EnvironmentEvent): number {
  const dbLevel = event.decibelLevel ?? 50;
  const duration = event.durationSeconds;

  if (dbLevel >= 80) return 10;
  if (dbLevel >= 70) return 7;
  if (dbLevel >= 60) return 5;
  if (duration > 60) return 5;
  return 3;
}

function calculateClimateDeduction(event: EnvironmentEvent): number {
  const delta = Math.abs(event.temperatureDelta ?? 0);
  if (delta >= 5) return 5;
  if (delta >= 3) return 3;
  return 2;
}

function calculateLightDeduction(event: EnvironmentEvent): number {
  const lux = event.luxLevel ?? 0;
  if (lux >= 100) return 4;
  if (lux >= 50) return 3;
  return 2;
}
