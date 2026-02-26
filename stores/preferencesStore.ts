/**
 * Preferences store — Zustand + SecureStore
 * Persists user sleep/environment preferences locally.
 * All temperatures stored internally in °F; converted for display only.
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type Sensitivity = 'low' | 'medium' | 'high';

export type MonitoringTheme =
  | 'fireflies'
  | 'breathing'
  | 'particles'
  | 'nebula'
  | 'constellation'
  | 'dandelion';

interface PreferencesState {
  /** "HH:mm" 24-hour format, e.g. "22:30" */
  bedtimeGoal: string;
  /** "HH:mm" 24-hour format, e.g. "06:30" */
  wakeGoal: string;
  /** true = Fahrenheit, false = Celsius */
  tempUnitF: boolean;
  partnerDefault: boolean;
  sensitivity: Sensitivity;
  /** Always stored in °F internally */
  thermostatF: number;
  monitoringTheme: MonitoringTheme;
  /** True once user has accepted the recording & audio privacy consent */
  recordingConsent: boolean;
  /** Apple Health integration (iOS only) */
  appleHealthEnabled: boolean;
  /** Sonar ultrasonic tracking (disable for pet-sensitive households) */
  sonarEnabled: boolean;
  isReady: boolean;

  initialize: () => Promise<void>;
  setBedtimeGoal: (time: string) => Promise<void>;
  setWakeGoal: (time: string) => Promise<void>;
  setTempUnitF: (useF: boolean) => Promise<void>;
  setPartnerDefault: (on: boolean) => Promise<void>;
  setSensitivity: (level: Sensitivity) => Promise<void>;
  setThermostatF: (tempF: number) => Promise<void>;
  setMonitoringTheme: (theme: MonitoringTheme) => Promise<void>;
  setRecordingConsent: (accepted: boolean) => Promise<void>;
  setAppleHealthEnabled: (enabled: boolean) => Promise<void>;
  setSonarEnabled: (enabled: boolean) => Promise<void>;
}

const KEY_PREFIX = 'driftlab_pref_';
const KEYS = {
  bedtimeGoal: `${KEY_PREFIX}bedtime`,
  wakeGoal: `${KEY_PREFIX}wake`,
  tempUnitF: `${KEY_PREFIX}tempunit`,
  partnerDefault: `${KEY_PREFIX}partner`,
  sensitivity: `${KEY_PREFIX}sensitivity`,
  thermostatF: `${KEY_PREFIX}thermostat`,
  monitoringTheme: `${KEY_PREFIX}monitoring_theme`,
  recordingConsent: `${KEY_PREFIX}recording_consent`,
  appleHealthEnabled: `${KEY_PREFIX}apple_health`,
  sonarEnabled: `${KEY_PREFIX}sonar`,
} as const;

// Defaults
const DEFAULT_BEDTIME = '22:30';
const DEFAULT_WAKE = '06:30';
const DEFAULT_THERMOSTAT_F = 68;
const DEFAULT_MONITORING_THEME: MonitoringTheme = 'fireflies';

export const usePreferencesStore = create<PreferencesState>((set) => ({
  bedtimeGoal: DEFAULT_BEDTIME,
  wakeGoal: DEFAULT_WAKE,
  tempUnitF: true,
  partnerDefault: false,
  sensitivity: 'medium',
  thermostatF: DEFAULT_THERMOSTAT_F,
  monitoringTheme: DEFAULT_MONITORING_THEME,
  recordingConsent: false,
  appleHealthEnabled: false,
  sonarEnabled: true,
  isReady: false,

  initialize: async () => {
    try {
      const [bedtime, wake, tempUnit, partner, sens, thermo, monTheme, consent, health, sonar] =
        await Promise.all([
          SecureStore.getItemAsync(KEYS.bedtimeGoal),
          SecureStore.getItemAsync(KEYS.wakeGoal),
          SecureStore.getItemAsync(KEYS.tempUnitF),
          SecureStore.getItemAsync(KEYS.partnerDefault),
          SecureStore.getItemAsync(KEYS.sensitivity),
          SecureStore.getItemAsync(KEYS.thermostatF),
          SecureStore.getItemAsync(KEYS.monitoringTheme),
          SecureStore.getItemAsync(KEYS.recordingConsent),
          SecureStore.getItemAsync(KEYS.appleHealthEnabled),
          SecureStore.getItemAsync(KEYS.sonarEnabled),
        ]);

      set({
        bedtimeGoal: bedtime ?? DEFAULT_BEDTIME,
        wakeGoal: wake ?? DEFAULT_WAKE,
        tempUnitF: tempUnit !== 'false', // default true
        partnerDefault: partner === 'true',
        sensitivity: (sens as Sensitivity) ?? 'medium',
        thermostatF: thermo ? Number(thermo) : DEFAULT_THERMOSTAT_F,
        monitoringTheme: (monTheme as MonitoringTheme) ?? DEFAULT_MONITORING_THEME,
        recordingConsent: consent === 'true',
        appleHealthEnabled: health === 'true',
        sonarEnabled: sonar !== 'false', // default true
        isReady: true,
      });
    } catch {
      set({ isReady: true });
    }
  },

  setBedtimeGoal: async (time) => {
    set({ bedtimeGoal: time });
    await SecureStore.setItemAsync(KEYS.bedtimeGoal, time);
  },

  setWakeGoal: async (time) => {
    set({ wakeGoal: time });
    await SecureStore.setItemAsync(KEYS.wakeGoal, time);
  },

  setTempUnitF: async (useF) => {
    set({ tempUnitF: useF });
    await SecureStore.setItemAsync(KEYS.tempUnitF, String(useF));
  },

  setPartnerDefault: async (on) => {
    set({ partnerDefault: on });
    await SecureStore.setItemAsync(KEYS.partnerDefault, String(on));
  },

  setSensitivity: async (level) => {
    set({ sensitivity: level });
    await SecureStore.setItemAsync(KEYS.sensitivity, level);
  },

  setThermostatF: async (tempF) => {
    set({ thermostatF: tempF });
    await SecureStore.setItemAsync(KEYS.thermostatF, String(tempF));
  },

  setMonitoringTheme: async (theme) => {
    set({ monitoringTheme: theme });
    await SecureStore.setItemAsync(KEYS.monitoringTheme, theme);
  },

  setRecordingConsent: async (accepted) => {
    set({ recordingConsent: accepted });
    await SecureStore.setItemAsync(KEYS.recordingConsent, String(accepted));
  },

  setAppleHealthEnabled: async (enabled) => {
    set({ appleHealthEnabled: enabled });
    await SecureStore.setItemAsync(KEYS.appleHealthEnabled, String(enabled));
  },

  setSonarEnabled: async (enabled) => {
    set({ sonarEnabled: enabled });
    await SecureStore.setItemAsync(KEYS.sonarEnabled, String(enabled));
  },
}));

// ── Conversion helpers ──

/** °F → °C (rounded to nearest integer) */
export function fToC(f: number): number {
  return Math.round(((f - 32) * 5) / 9);
}

/** °C → °F (rounded to nearest integer) */
export function cToF(c: number): number {
  return Math.round((c * 9) / 5 + 32);
}

/** Format "HH:mm" → display string respecting unit preference.
 *  When tempUnitF is false (metric/EU), show 24h format "22:30".
 *  When tempUnitF is true (imperial/US), show 12h format "10:30 PM".
 */
export function formatTime(hhmm: string, use12h: boolean): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = mStr ?? '00';

  if (!use12h) return `${String(h).padStart(2, '0')}:${m}`;

  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}
