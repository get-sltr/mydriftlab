/**
 * Night summary writer
 * Phase 1: Template-based natural language summaries
 * Counts events, calculates disruption minutes, identifies top disruptor
 */

import { EnvironmentEvent } from '../../lib/types';
import { eventCategories } from '../../lib/eventCategories';

export function writeNightSummary(
  events: EnvironmentEvent[],
  sleepDurationMinutes: number,
  restScore: number,
): string {
  if (events.length === 0) {
    return `You slept for ${formatDuration(sleepDurationMinutes)} with no detected disruptions. A peaceful night.`;
  }

  const totalDisruptionMinutes = events.reduce(
    (sum, e) => sum + Math.ceil(e.durationSeconds / 60),
    0,
  );

  const categoryGroups = events.reduce(
    (acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCategory = Object.entries(categoryGroups).sort(
    ([, a], [, b]) => b - a,
  )[0];

  const topCategoryLabel =
    eventCategories[topCategory[0]]?.label ?? topCategory[0];

  const worstEvent = events.reduce((worst, e) =>
    (e.decibelLevel ?? 0) > (worst.decibelLevel ?? 0) ? e : worst,
  );

  const worstTime = new Date(worstEvent.timestamp).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  let tone = '';
  if (restScore >= 80) {
    tone = 'A solid night overall.';
  } else if (restScore >= 60) {
    tone = 'Not bad, but there\'s room to improve.';
  } else if (restScore >= 40) {
    tone = 'Rough night, but your average is still trending up.';
  } else {
    tone = 'These nights happen. The key is what you can adjust tonight.';
  }

  return `You slept for ${formatDuration(sleepDurationMinutes)}. ${events.length} disruption${events.length === 1 ? '' : 's'} detected, the most notable at ${worstTime}. ${topCategoryLabel} was the primary factor, contributing to about ${totalDisruptionMinutes} minutes of fragmented sleep. ${tone}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} minutes`;
  if (mins === 0) return `${hours} hour${hours === 1 ? '' : 's'}`;
  return `${hours}h ${mins}m`;
}
