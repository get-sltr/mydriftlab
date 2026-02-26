/**
 * Apple Health service — read/write wrapper for HealthKit.
 *
 * Uses @kingstinct/react-native-healthkit for iOS HealthKit access.
 * Gracefully degrades on Android and simulator (all methods return null/false).
 *
 * Tiered experience:
 *   Phone-only: sonar sleep/wake + BDI from audio + BreathTrend from mic
 *   With wearable: above + sleep stages, HRV, SpO2, respiratory rate
 */

import { Platform } from 'react-native';
import type { AppleHealthSleepData } from '../../lib/types';

// Lazy-import HealthKit to avoid crashes on Android
let HK: typeof import('@kingstinct/react-native-healthkit') | null = null;

async function getHK() {
  if (Platform.OS !== 'ios') return null;
  if (!HK) {
    try {
      HK = await import('@kingstinct/react-native-healthkit');
    } catch {
      return null;
    }
  }
  return HK;
}

/** Check if HealthKit is available on this device. */
export async function isAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const hk = await getHK();
    if (!hk) return false;
    return await hk.isHealthDataAvailableAsync();
  } catch {
    return false;
  }
}

/** Request read/write permissions for sleep-related data types. */
export async function requestPermissions(): Promise<boolean> {
  const hk = await getHK();
  if (!hk) return false;

  try {
    await hk.requestAuthorization({
      toRead: [
        'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
        'HKQuantityTypeIdentifierRespiratoryRate',
        'HKQuantityTypeIdentifierOxygenSaturation',
        'HKQuantityTypeIdentifierHeartRate',
        'HKCategoryTypeIdentifierSleepAnalysis',
      ],
      toShare: [
        'HKCategoryTypeIdentifierSleepAnalysis',
      ],
    });
    return true;
  } catch {
    return false;
  }
}

/** Read sleep data from Apple Health for a given date range. */
export async function readSleepData(
  start: Date,
  end: Date,
): Promise<AppleHealthSleepData | null> {
  const hk = await getHK();
  if (!hk) return null;

  try {
    // Import the enum for sleep stage values
    const { CategoryValueSleepAnalysis } = await import(
      '@kingstinct/react-native-healthkit'
    );

    // Read sleep analysis samples
    const sleepSamples = await hk.queryCategorySamples(
      'HKCategoryTypeIdentifierSleepAnalysis',
      {
        limit: 0, // 0 = no limit
        filter: {
          date: { startDate: start, endDate: end },
        },
      },
    );

    // Aggregate sleep stages
    let awakeMinutes = 0;
    let remMinutes = 0;
    let coreMinutes = 0;
    let deepMinutes = 0;

    for (const sample of sleepSamples) {
      const durationMin =
        (new Date(sample.endDate).getTime() - new Date(sample.startDate).getTime()) /
        60000;

      switch (sample.value) {
        case CategoryValueSleepAnalysis.awake:
          awakeMinutes += durationMin;
          break;
        case CategoryValueSleepAnalysis.asleepREM:
          remMinutes += durationMin;
          break;
        case CategoryValueSleepAnalysis.asleepCore:
          coreMinutes += durationMin;
          break;
        case CategoryValueSleepAnalysis.asleepDeep:
          deepMinutes += durationMin;
          break;
        default:
          // asleepUnspecified — count as core
          coreMinutes += durationMin;
      }
    }

    const totalSleepMinutes = Math.round(remMinutes + coreMinutes + deepMinutes);

    // Read HRV
    const hrv = await readQuantitySamples(
      hk,
      'HKQuantityTypeIdentifierHeartRateVariabilitySDNN',
      start,
      end,
    );

    // Read respiratory rate
    const respRate = await readQuantitySamples(
      hk,
      'HKQuantityTypeIdentifierRespiratoryRate',
      start,
      end,
    );

    // Read SpO2
    const spo2 = await readQuantitySamples(
      hk,
      'HKQuantityTypeIdentifierOxygenSaturation',
      start,
      end,
    );

    // Read heart rate
    const heartRateSamples = await readQuantitySamples(
      hk,
      'HKQuantityTypeIdentifierHeartRate',
      start,
      end,
    );

    const heartRate =
      heartRateSamples.length > 0
        ? {
            avg: Math.round(
              heartRateSamples.reduce((s, v) => s + v, 0) / heartRateSamples.length,
            ),
            min: Math.round(Math.min(...heartRateSamples)),
            max: Math.round(Math.max(...heartRateSamples)),
          }
        : null;

    return {
      sleepStages: {
        awake: Math.round(awakeMinutes),
        rem: Math.round(remMinutes),
        core: Math.round(coreMinutes),
        deep: Math.round(deepMinutes),
      },
      totalSleepMinutes,
      hrv: hrv.length > 0 ? Math.round(average(hrv)) : null,
      respiratoryRate: respRate.length > 0 ? Math.round(average(respRate) * 10) / 10 : null,
      spo2: spo2.length > 0 ? Math.round(average(spo2) * 100) : null,
      heartRate,
    };
  } catch {
    return null;
  }
}

/** Write a sleep session back to HealthKit. */
export async function writeSleepSession(
  startDate: Date,
  endDate: Date,
): Promise<boolean> {
  const hk = await getHK();
  if (!hk) return false;

  try {
    const { CategoryValueSleepAnalysis } = await import(
      '@kingstinct/react-native-healthkit'
    );

    await hk.saveCategorySample(
      'HKCategoryTypeIdentifierSleepAnalysis',
      CategoryValueSleepAnalysis.asleepUnspecified,
      startDate,
      endDate,
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Check what wearable data types have recent data available.
 */
export async function getDataAvailability(): Promise<{
  sleepStages: boolean;
  hrv: boolean;
  respiratoryRate: boolean;
  spo2: boolean;
  heartRate: boolean;
}> {
  const hk = await getHK();
  if (!hk) {
    return {
      sleepStages: false,
      hrv: false,
      respiratoryRate: false,
      spo2: false,
      heartRate: false,
    };
  }

  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  const [sleep, hrv, resp, spo2, hr] = await Promise.all([
    hasRecentCategoryData(hk, 'HKCategoryTypeIdentifierSleepAnalysis', threeDaysAgo, now),
    hasRecentQuantityData(hk, 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN', threeDaysAgo, now),
    hasRecentQuantityData(hk, 'HKQuantityTypeIdentifierRespiratoryRate', threeDaysAgo, now),
    hasRecentQuantityData(hk, 'HKQuantityTypeIdentifierOxygenSaturation', threeDaysAgo, now),
    hasRecentQuantityData(hk, 'HKQuantityTypeIdentifierHeartRate', threeDaysAgo, now),
  ]);

  return {
    sleepStages: sleep,
    hrv,
    respiratoryRate: resp,
    spo2,
    heartRate: hr,
  };
}

// ── Helpers ──────────────────────────────────────────────────

async function readQuantitySamples(
  hk: any,
  type: string,
  start: Date,
  end: Date,
): Promise<number[]> {
  try {
    const samples = await hk.queryQuantitySamples(type, {
      limit: 0,
      filter: {
        date: { startDate: start, endDate: end },
      },
    });
    return samples.map((s: any) => s.quantity);
  } catch {
    return [];
  }
}

async function hasRecentCategoryData(
  hk: any,
  type: string,
  start: Date,
  end: Date,
): Promise<boolean> {
  try {
    const samples = await hk.queryCategorySamples(type, {
      limit: 1,
      filter: {
        date: { startDate: start, endDate: end },
      },
    });
    return samples.length > 0;
  } catch {
    return false;
  }
}

async function hasRecentQuantityData(
  hk: any,
  type: string,
  start: Date,
  end: Date,
): Promise<boolean> {
  try {
    const samples = await hk.queryQuantitySamples(type, {
      limit: 1,
      filter: {
        date: { startDate: start, endDate: end },
      },
    });
    return samples.length > 0;
  } catch {
    return false;
  }
}

function average(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
