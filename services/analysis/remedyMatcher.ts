/**
 * Remedy Matcher — pattern-to-remedy suggestion engine.
 *
 * Analyzes recent session data (BDI, sleep efficiency, event patterns)
 * and returns up to 5 prioritized RemedySuggestion objects.
 */

import { remedies } from '../../data/remedies';
import type { Remedy, RemedySuggestion, MatchRule } from '../../lib/types';

interface UserMetrics {
  bdi: number;
  sleepEfficiency: number;
  snoring_nights_per_week: number;
  noise_events: number;
  light_events: number;
  temperature_events: number;
  breathingRegularity: number;
}

const MAX_SUGGESTIONS = 5;

/**
 * Match user metrics against remedy rules and return prioritized suggestions.
 *
 * @param metrics   — aggregated metrics from recent sessions
 * @param triedIds  — IDs of remedies the user has already tried
 */
export function matchRemedies(
  metrics: UserMetrics,
  triedIds: Set<string> = new Set(),
): RemedySuggestion[] {
  const suggestions: RemedySuggestion[] = [];

  for (const remedy of remedies) {
    // Skip already-tried remedies
    if (triedIds.has(remedy.id)) continue;

    const matchResult = evaluateRules(remedy.matchRules, metrics);
    if (!matchResult.matches) continue;

    suggestions.push({
      remedy,
      priority: calculatePriority(remedy, metrics, matchResult.matchCount),
      reason: buildReason(remedy, metrics),
    });
  }

  // Sort by priority descending, take top N
  suggestions.sort((a, b) => b.priority - a.priority);
  const top = suggestions.slice(0, MAX_SUGGESTIONS);

  // Add medical disclaimer if BDI is high
  if (metrics.bdi > 15) {
    const hasDisclaimer = top.some(
      (s) => s.reason.includes('consult') || s.reason.includes('specialist'),
    );
    if (!hasDisclaimer && top.length > 0) {
      top[0].reason +=
        ' Your BDI is elevated — consider consulting a sleep specialist.';
    }
  }

  return top;
}

// ── Helpers ──────────────────────────────────────────────────

function evaluateRules(
  rules: MatchRule[],
  metrics: UserMetrics,
): { matches: boolean; matchCount: number } {
  let matchCount = 0;

  for (const rule of rules) {
    const value = (metrics as any)[rule.metric];
    if (value === undefined) continue;

    const passes = evaluateCondition(value, rule.condition, rule.value);
    if (passes) matchCount++;
  }

  // At least one rule must match
  return { matches: matchCount > 0, matchCount };
}

function evaluateCondition(
  actual: number,
  condition: MatchRule['condition'],
  threshold: number,
): boolean {
  switch (condition) {
    case 'gt':  return actual > threshold;
    case 'lt':  return actual < threshold;
    case 'gte': return actual >= threshold;
    case 'lte': return actual <= threshold;
    case 'eq':  return actual === threshold;
    default:    return false;
  }
}

function calculatePriority(
  remedy: Remedy,
  metrics: UserMetrics,
  matchCount: number,
): number {
  let priority = matchCount * 10;

  // Boost by evidence level
  if (remedy.evidenceLevel === 'strong') priority += 15;
  else if (remedy.evidenceLevel === 'moderate') priority += 10;
  else priority += 5;

  // Boost high-BDI remedies when BDI is elevated
  if (metrics.bdi > 15 && remedy.targetMetrics.includes('bdi')) {
    priority += 20;
  }

  // Boost low-efficiency remedies when efficiency is low
  if (
    metrics.sleepEfficiency < 75 &&
    remedy.targetMetrics.includes('sleepEfficiency')
  ) {
    priority += 15;
  }

  // Boost snoring remedies when frequent
  if (
    metrics.snoring_nights_per_week >= 4 &&
    remedy.targetMetrics.includes('snoring')
  ) {
    priority += 10;
  }

  return priority;
}

function buildReason(remedy: Remedy, metrics: UserMetrics): string {
  const parts: string[] = [];

  if (remedy.targetMetrics.includes('bdi') && metrics.bdi > 5) {
    parts.push(`Your BDI is ${metrics.bdi}`);
  }

  if (
    remedy.targetMetrics.includes('sleepEfficiency') &&
    metrics.sleepEfficiency < 85
  ) {
    parts.push(`sleep efficiency is ${metrics.sleepEfficiency}%`);
  }

  if (
    remedy.targetMetrics.includes('snoring') &&
    metrics.snoring_nights_per_week >= 3
  ) {
    parts.push(
      `snoring detected ${metrics.snoring_nights_per_week} nights/week`,
    );
  }

  if (
    remedy.targetMetrics.includes('noise_events') &&
    metrics.noise_events > 3
  ) {
    parts.push(`${metrics.noise_events} noise disruptions detected`);
  }

  if (
    remedy.targetMetrics.includes('light_events') &&
    metrics.light_events > 1
  ) {
    parts.push(`${metrics.light_events} light disruptions detected`);
  }

  if (
    remedy.targetMetrics.includes('temperature_events') &&
    metrics.temperature_events > 2
  ) {
    parts.push(`${metrics.temperature_events} temperature events detected`);
  }

  if (parts.length === 0) {
    return `Based on your sleep patterns, ${remedy.name.toLowerCase()} may help.`;
  }

  return parts.join(', ') + `. ${remedy.name} may help.`;
}
