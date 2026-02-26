/**
 * Weekly Insights — cross-session pattern analysis.
 *
 * Takes the past 7 days of sessions + events and generates explanatory
 * reports: day-by-day breakdowns explaining WHY nights were good or bad,
 * detected patterns, and actionable recommendations.
 */

import type {
  SleepSession,
  EnvironmentEvent,
  WeeklyReport,
  DailyBreakdown,
  PatternInsight,
} from '../../lib/types';
import { calculateRestScore } from './scoring';

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface SessionWithEvents {
  session: SleepSession;
  events: EnvironmentEvent[];
}

/**
 * Generate a weekly report from sessions and their events.
 * `currentWeek` = sessions from the past 7 days.
 * `prevWeek` = (optional) sessions from 8–14 days ago for comparison.
 */
export function generateWeeklyReport(
  currentWeek: SessionWithEvents[],
  prevWeek: SessionWithEvents[] = [],
): WeeklyReport {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);

  // Build daily breakdowns for the last 7 days
  const dailyBreakdowns: DailyBreakdown[] = [];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = DAY_LABELS[date.getDay()];

    // Find session for this date
    const match = currentWeek.find((sw) => {
      const sessionDate = sw.session.startedAt.split('T')[0];
      return sessionDate === dateStr;
    });

    if (!match || match.session.status !== 'complete') {
      dailyBreakdowns.push({
        date: dateStr,
        dayLabel,
        score: null,
        explanation: 'No data recorded',
        topDisruptor: null,
      });
      continue;
    }

    const score = match.session.restScore ?? calculateRestScore(match.events, false);
    const { explanation, topDisruptor } = explainNight(match.events, score);

    dailyBreakdowns.push({
      date: dateStr,
      dayLabel,
      score,
      explanation,
      topDisruptor,
    });
  }

  // Compute averages
  const scoredDays = dailyBreakdowns.filter((d) => d.score !== null);
  const avgScore = scoredDays.length > 0
    ? Math.round(scoredDays.reduce((sum, d) => sum + (d.score ?? 0), 0) / scoredDays.length)
    : 0;

  const prevScored = prevWeek
    .filter((sw) => sw.session.status === 'complete' && sw.session.restScore !== null)
    .map((sw) => sw.session.restScore!);
  const prevWeekAvgScore = prevScored.length > 0
    ? Math.round(prevScored.reduce((a, b) => a + b, 0) / prevScored.length)
    : null;

  // Detect patterns across the week
  const allEvents = currentWeek.flatMap((sw) => sw.events);
  const patterns = detectPatterns(currentWeek, dailyBreakdowns, allEvents);

  // Top recommendation
  const topRecommendation = generateTopRecommendation(patterns, dailyBreakdowns);

  return {
    weekStart: weekStart.toISOString().split('T')[0],
    weekEnd: now.toISOString().split('T')[0],
    avgScore,
    prevWeekAvgScore,
    dailyBreakdowns,
    patterns,
    topRecommendation,
  };
}

// ── Helpers ──────────────────────────────────────────────────────

/** Group events by category with full EnvironmentEvent type preserved */
function groupByCategory(events: EnvironmentEvent[]): Record<string, EnvironmentEvent[]> {
  const groups: Record<string, EnvironmentEvent[]> = {};
  for (const evt of events) {
    if (!groups[evt.category]) groups[evt.category] = [];
    groups[evt.category].push(evt);
  }
  return groups;
}

function explainNight(
  events: EnvironmentEvent[],
  score: number,
): { explanation: string; topDisruptor: string | null } {
  if (events.length === 0) {
    return {
      explanation: score >= 80 ? 'Quiet night, environment stable' : 'Minimal disruptions detected',
      topDisruptor: null,
    };
  }

  const grouped = groupByCategory(events);
  const parts: string[] = [];
  let topDisruptor: string | null = null;
  let maxCount = 0;

  // Noise events
  const noiseEvents = grouped['noise'] ?? [];
  if (noiseEvents.length > 0) {
    const snoringEvents = noiseEvents.filter((e) => e.type.toLowerCase().includes('snor'));
    if (snoringEvents.length > 0) {
      const times = getTimeRange(snoringEvents);
      parts.push(`${snoringEvents.length} snoring episode${snoringEvents.length > 1 ? 's' : ''} ${times}`);
    }
    const otherNoise = noiseEvents.length - snoringEvents.length;
    if (otherNoise > 0) {
      parts.push(`${otherNoise} noise event${otherNoise > 1 ? 's' : ''}`);
    }
    if (noiseEvents.length > maxCount) {
      maxCount = noiseEvents.length;
      topDisruptor = 'noise';
    }
  }

  // Climate events
  const climateEvents = grouped['climate'] ?? [];
  if (climateEvents.length > 0) {
    const tempDrops = climateEvents.filter((e) =>
      e.temperatureDelta !== undefined && e.temperatureDelta < 0,
    );
    if (tempDrops.length > 0) {
      const maxDrop = Math.min(...tempDrops.map((e) => e.temperatureDelta ?? 0));
      parts.push(`room temp dropped ${Math.abs(Math.round(maxDrop))}°F`);
    } else {
      parts.push(`${climateEvents.length} climate event${climateEvents.length > 1 ? 's' : ''}`);
    }
    if (climateEvents.length > maxCount) {
      maxCount = climateEvents.length;
      topDisruptor = 'climate';
    }
  }

  // Light events
  const lightEvents = grouped['light'] ?? [];
  if (lightEvents.length > 0) {
    parts.push(`${lightEvents.length} light disruption${lightEvents.length > 1 ? 's' : ''}`);
    if (lightEvents.length > maxCount) {
      maxCount = lightEvents.length;
      topDisruptor = 'light';
    }
  }

  // Partner events
  const partnerEvents = grouped['partner'] ?? [];
  if (partnerEvents.length > 0) {
    parts.push(`${partnerEvents.length} partner movement${partnerEvents.length > 1 ? 's' : ''}`);
    if (partnerEvents.length > maxCount) {
      topDisruptor = 'partner';
    }
  }

  const explanation = parts.length > 0 ? parts.join(', ') : 'Environment data recorded';
  return { explanation, topDisruptor };
}

function getTimeRange(events: EnvironmentEvent[]): string {
  if (events.length === 0) return '';
  const times = events.map((e) => new Date(e.timestamp).getHours());
  const earliest = Math.min(...times);
  const latest = Math.max(...times);
  if (earliest === latest) return `around ${earliest}:00`;
  return `between ${earliest}–${latest + 1} AM`;
}

function detectPatterns(
  sessions: SessionWithEvents[],
  breakdowns: DailyBreakdown[],
  allEvents: EnvironmentEvent[],
): PatternInsight[] {
  const patterns: PatternInsight[] = [];

  // 1. Recurring noise at similar times
  const noiseEvents = allEvents.filter((e) => e.category === 'noise');
  if (noiseEvents.length >= 3) {
    const hourBuckets = new Map<number, number>();
    for (const e of noiseEvents) {
      const hour = new Date(e.timestamp).getHours();
      hourBuckets.set(hour, (hourBuckets.get(hour) ?? 0) + 1);
    }
    for (const [hour, count] of hourBuckets) {
      if (count >= 3) {
        const period = hour < 6 ? 'early morning' : hour < 12 ? 'morning' : 'evening';
        patterns.push({
          title: `Recurring ${period} noise`,
          body: `You had consistent noise disruptions around ${hour}:00 on ${count} nights — could be an early routine or external source.`,
          category: 'noise',
          impact: 'negative',
        });
      }
    }
  }

  // 2. Temperature correlation
  const scoredWithTemp = sessions
    .filter((sw) => sw.session.restScore !== null)
    .map((sw) => {
      const avgTemp = sw.events
        .filter((e) => e.temperatureF !== undefined)
        .reduce((sum, e, _, arr) => sum + (e.temperatureF ?? 0) / arr.length, 0);
      return { score: sw.session.restScore!, avgTemp };
    })
    .filter((s) => s.avgTemp > 0);

  if (scoredWithTemp.length >= 3) {
    const bestNights = scoredWithTemp.filter((s) => s.score >= 80);
    const worstNights = scoredWithTemp.filter((s) => s.score < 60);

    if (bestNights.length >= 2 && worstNights.length >= 1) {
      const bestAvgTemp = Math.round(
        bestNights.reduce((s, n) => s + n.avgTemp, 0) / bestNights.length,
      );
      const worstAvgTemp = Math.round(
        worstNights.reduce((s, n) => s + n.avgTemp, 0) / worstNights.length,
      );

      if (Math.abs(bestAvgTemp - worstAvgTemp) >= 3) {
        patterns.push({
          title: 'Temperature sweet spot',
          body: `Your best nights (80+) had room temps around ${bestAvgTemp}°F. Your worst nights averaged ${worstAvgTemp}°F.`,
          category: 'climate',
          impact: 'neutral',
        });
      }
    }
  }

  // 3. Weekday vs weekend pattern
  const scored = breakdowns.filter((d) => d.score !== null);
  const weeknights = scored.filter((d) => {
    const dow = new Date(d.date).getDay();
    return dow >= 1 && dow <= 4; // Mon-Thu
  });
  const weekends = scored.filter((d) => {
    const dow = new Date(d.date).getDay();
    return dow === 0 || dow === 5 || dow === 6; // Fri-Sun
  });

  if (weeknights.length >= 2 && weekends.length >= 1) {
    const wnAvg = Math.round(weeknights.reduce((s, d) => s + (d.score ?? 0), 0) / weeknights.length);
    const weAvg = Math.round(weekends.reduce((s, d) => s + (d.score ?? 0), 0) / weekends.length);

    if (Math.abs(wnAvg - weAvg) >= 8) {
      const better = wnAvg > weAvg ? 'weeknights' : 'weekends';
      const worse = better === 'weeknights' ? 'weekends' : 'weeknights';
      patterns.push({
        title: 'Weekday vs weekend gap',
        body: `${better.charAt(0).toUpperCase() + better.slice(1)} average ${Math.max(wnAvg, weAvg)} vs ${worse} at ${Math.min(wnAvg, weAvg)} — consider your ${worse} routine.`,
        category: 'general',
        impact: 'neutral',
      });
    }
  }

  // 4. Snoring pattern
  const snoringNights = sessions.filter((sw) =>
    sw.events.some((e) => e.type.toLowerCase().includes('snor')),
  );
  if (snoringNights.length >= 3) {
    const snoringEvents = allEvents.filter((e) => e.type.toLowerCase().includes('snor'));
    const hours = snoringEvents.map((e) => new Date(e.timestamp).getHours());
    const minH = Math.min(...hours);
    const maxH = Math.max(...hours);

    patterns.push({
      title: 'Frequent snoring',
      body: `Snoring was detected ${snoringNights.length} of 7 nights, mostly between ${minH}–${maxH + 1} AM.`,
      category: 'noise',
      impact: 'negative',
    });
  }

  return patterns;
}

function generateTopRecommendation(
  patterns: PatternInsight[],
  breakdowns: DailyBreakdown[],
): string {
  // Priority: temperature > noise > general
  const tempPattern = patterns.find((p) => p.category === 'climate');
  if (tempPattern) {
    return 'Try keeping your room temperature consistent throughout the night. Even small drops can trigger wake events.';
  }

  const noisePattern = patterns.find((p) => p.category === 'noise');
  if (noisePattern) {
    if (noisePattern.title.includes('snoring')) {
      return 'Consistent snoring may benefit from trying a different sleep position or consulting a sleep specialist.';
    }
    return 'Consider using a white noise machine or earplugs to mask recurring environmental noise.';
  }

  const scored = breakdowns.filter((d) => d.score !== null);
  const avg = scored.length > 0
    ? scored.reduce((s, d) => s + (d.score ?? 0), 0) / scored.length
    : 0;

  if (avg >= 80) {
    return 'Your sleep environment is excellent this week. Keep up your current routine!';
  }

  if (avg >= 60) {
    return 'Your sleep is decent but has room for improvement. Review the patterns above for specific areas to address.';
  }

  return 'This was a challenging week for sleep. Focus on controlling the biggest disruptor shown in your patterns.';
}
