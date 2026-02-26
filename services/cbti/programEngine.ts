/**
 * CBT-I Program Engine — Cognitive Behavioral Therapy for Insomnia.
 *
 * Manages the 6-week structured program:
 *   Week 1: Baseline + Education
 *   Week 2: Sleep Restriction
 *   Week 3: Stimulus Control
 *   Week 4: Cognitive Restructuring
 *   Week 5: Relaxation Training
 *   Week 6: Maintenance & Graduation
 *
 * Core algorithm — Sleep Restriction Therapy:
 *   1. Baseline week: calculate avg sleep time from sonar efficiency data
 *   2. Week 2: prescribedTimeInBed = max(avgSleepTime, 5.5 hours). Fixed wake time.
 *   3. Each subsequent week:
 *      - efficiency >= 85% → add 15 min
 *      - efficiency < 80%  → subtract 15 min (floor 5.5 hrs)
 *      - 80-85%            → no change
 *   4. Goal: reach 85%+ efficiency with adequate total sleep time
 */

import type { CBTIProgram, SleepDiaryEntry, CBTIWeek } from '../../lib/types';

// ── Week definitions ─────────────────────────────────────────

export const CBTI_WEEKS: CBTIWeek[] = [
  {
    week: 1,
    focus: 'Baseline + Education',
    keyAction: 'Track sleep diary, learn sleep efficiency concept, calculate baseline',
  },
  {
    week: 2,
    focus: 'Sleep Restriction',
    keyAction: 'Restrict time-in-bed to match actual sleep time (min 5.5hrs). Fixed wake time.',
  },
  {
    week: 3,
    focus: 'Stimulus Control',
    keyAction: 'Bed = sleep only, get up if awake >20 min, no clock-watching',
  },
  {
    week: 4,
    focus: 'Cognitive Restructuring',
    keyAction: 'Challenge beliefs: "I need 8 hours", "One bad night ruins the week"',
  },
  {
    week: 5,
    focus: 'Relaxation Training',
    keyAction: 'PMR, 4-7-8 breathing, body scan',
  },
  {
    week: 6,
    focus: 'Maintenance',
    keyAction: 'Review progress, set long-term habits, graduation',
  },
];

// Minimum time in bed (5.5 hours = 330 minutes)
const MIN_TIME_IN_BED_MINUTES = 330;
// Adjustment step (15 minutes)
const ADJUSTMENT_STEP_MINUTES = 15;

// ── Program creation ─────────────────────────────────────────

export function createProgram(
  userId: string,
  wakeTime: string = '06:30',
): CBTIProgram {
  const id = `cbti_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    userId,
    status: 'active',
    startedAt: new Date().toISOString(),
    currentWeek: 1,
    baselineSleepEfficiency: 0,
    currentSleepEfficiency: 0,
    prescribedBedtime: '23:00', // default, will be calculated after baseline
    prescribedWakeTime: wakeTime,
    timeInBedMinutes: 450, // 7.5 hours default until baseline calculated
    sleepDiary: [],
  };
}

// ── Baseline calculation ─────────────────────────────────────

/**
 * Calculate baseline from the first 7 diary entries.
 * Returns average sleep time and efficiency.
 */
export function calculateBaseline(entries: SleepDiaryEntry[]): {
  avgSleepMinutes: number;
  avgEfficiency: number;
} {
  const valid = entries.filter((e) => e.totalSleepTime > 0);
  if (valid.length === 0) return { avgSleepMinutes: 0, avgEfficiency: 0 };

  const avgSleep =
    valid.reduce((s, e) => s + e.totalSleepTime, 0) / valid.length;
  const avgEff =
    valid.reduce((s, e) => s + e.efficiency, 0) / valid.length;

  return {
    avgSleepMinutes: Math.round(avgSleep),
    avgEfficiency: Math.round(avgEff),
  };
}

// ── Sleep Restriction Therapy ────────────────────────────────

/**
 * Calculate the prescribed time-in-bed based on sleep restriction rules.
 *
 * @param currentTimeInBed — current prescribed time-in-bed in minutes
 * @param weeklyEfficiency — this week's average sleep efficiency %
 * @returns new prescribed time-in-bed in minutes
 */
export function adjustTimeInBed(
  currentTimeInBed: number,
  weeklyEfficiency: number,
): number {
  if (weeklyEfficiency >= 85) {
    // Doing well — expand the window
    return currentTimeInBed + ADJUSTMENT_STEP_MINUTES;
  }
  if (weeklyEfficiency < 80) {
    // Still inefficient — restrict further
    return Math.max(MIN_TIME_IN_BED_MINUTES, currentTimeInBed - ADJUSTMENT_STEP_MINUTES);
  }
  // 80-84% — hold steady
  return currentTimeInBed;
}

/**
 * Calculate bedtime from wake time and time-in-bed.
 *
 * @param wakeTime — "HH:mm" format
 * @param timeInBedMinutes — prescribed time in bed
 * @returns bedtime as "HH:mm"
 */
export function calculateBedtime(
  wakeTime: string,
  timeInBedMinutes: number,
): string {
  const [wh, wm] = wakeTime.split(':').map(Number);
  const wakeMinutesFromMidnight = wh * 60 + wm;
  let bedMinutesFromMidnight = wakeMinutesFromMidnight - timeInBedMinutes;

  // Wrap around midnight
  if (bedMinutesFromMidnight < 0) {
    bedMinutesFromMidnight += 24 * 60;
  }

  const bh = Math.floor(bedMinutesFromMidnight / 60);
  const bm = bedMinutesFromMidnight % 60;

  return `${String(bh).padStart(2, '0')}:${String(bm).padStart(2, '0')}`;
}

/**
 * After baseline week, set the initial sleep restriction window.
 */
export function setInitialRestriction(
  program: CBTIProgram,
  avgSleepMinutes: number,
): CBTIProgram {
  const timeInBed = Math.max(MIN_TIME_IN_BED_MINUTES, avgSleepMinutes);
  const bedtime = calculateBedtime(program.prescribedWakeTime, timeInBed);

  return {
    ...program,
    timeInBedMinutes: timeInBed,
    prescribedBedtime: bedtime,
  };
}

// ── Weekly progression ───────────────────────────────────────

/**
 * Advance the program by one week, adjusting prescription.
 */
export function advanceWeek(
  program: CBTIProgram,
  weeklyEfficiency: number,
): CBTIProgram {
  const nextWeek = program.currentWeek + 1;

  if (nextWeek > 6) {
    return { ...program, status: 'completed', currentSleepEfficiency: weeklyEfficiency };
  }

  // Adjust time-in-bed based on efficiency (from week 2+)
  const newTimeInBed =
    program.currentWeek >= 2
      ? adjustTimeInBed(program.timeInBedMinutes, weeklyEfficiency)
      : program.timeInBedMinutes;

  const newBedtime = calculateBedtime(program.prescribedWakeTime, newTimeInBed);

  return {
    ...program,
    currentWeek: nextWeek,
    currentSleepEfficiency: weeklyEfficiency,
    timeInBedMinutes: newTimeInBed,
    prescribedBedtime: newBedtime,
  };
}

// ── Diary helpers ────────────────────────────────────────────

/**
 * Calculate derived fields for a sleep diary entry.
 */
export function calculateDiaryEntry(
  partial: Omit<SleepDiaryEntry, 'timeInBed' | 'totalSleepTime' | 'efficiency'>,
): SleepDiaryEntry {
  // Time in bed: outOfBed - bedtime in minutes
  const bedMinutes = timeToMinutes(partial.bedtime);
  const outMinutes = timeToMinutes(partial.outOfBed);
  let timeInBed = outMinutes - bedMinutes;
  if (timeInBed < 0) timeInBed += 24 * 60; // crossed midnight

  // Total sleep = time in bed - onset - wake periods
  const totalSleepTime = Math.max(
    0,
    timeInBed - partial.sleepOnsetMinutes - partial.wakeMinutes,
  );

  // Efficiency
  const efficiency =
    timeInBed > 0 ? Math.round((totalSleepTime / timeInBed) * 100) : 0;

  return {
    ...partial,
    timeInBed,
    totalSleepTime,
    efficiency,
  };
}

/**
 * Get weekly progress summary from diary entries.
 */
export function getWeeklyProgress(
  entries: SleepDiaryEntry[],
  week: number,
): {
  efficiency: number;
  adherence: number;
  trend: 'improving' | 'stable' | 'declining';
} {
  if (entries.length === 0) {
    return { efficiency: 0, adherence: 0, trend: 'stable' };
  }

  // Week entries (last 7 days ideally)
  const weekEntries = entries.slice(-7);
  const avgEff =
    weekEntries.reduce((s, e) => s + e.efficiency, 0) / weekEntries.length;

  // Adherence = how many of the last 7 days have diary entries
  const adherence = Math.round((weekEntries.length / 7) * 100);

  // Trend: compare last 3 vs previous 3
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (entries.length >= 6) {
    const recent3 = entries.slice(-3);
    const prev3 = entries.slice(-6, -3);
    const recentAvg =
      recent3.reduce((s, e) => s + e.efficiency, 0) / recent3.length;
    const prevAvg =
      prev3.reduce((s, e) => s + e.efficiency, 0) / prev3.length;

    if (recentAvg - prevAvg > 3) trend = 'improving';
    else if (prevAvg - recentAvg > 3) trend = 'declining';
  }

  return {
    efficiency: Math.round(avgEff),
    adherence,
    trend,
  };
}

// ── Time helpers ─────────────────────────────────────────────

function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}
