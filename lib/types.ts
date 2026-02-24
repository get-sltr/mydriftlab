/**
 * DriftLab Core Data Types
 */

export interface SleepSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt: string | null;
  status: 'wind_down' | 'recording' | 'processing' | 'complete';
  restScore: number | null;
  nightSummary: string | null;
  windDownContentId: string | null;
  smartFadeAt: string | null;
  experimentId: string | null;
  partnerPresent: boolean;
}

export interface EnvironmentEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  category: 'noise' | 'climate' | 'light' | 'partner';
  type: string;
  severity: 'low' | 'medium' | 'high';
  durationSeconds: number;
  decibelLevel?: number;
  temperatureF?: number;
  temperatureDelta?: number;
  luxLevel?: number;
  lightSource?: string;
  humidityEstimate?: number;
  snorerIdentity?: string;
  confidence: number;
  audioClipId?: string;
}

export interface ContentItem {
  id: string;
  type: 'story' | 'soundscape' | 'meditation' | 'breathing' | 'music';
  title: string;
  narrator?: string;
  durationSeconds: number;
  category: string;
  isAdaptive: boolean;
  tags: string[];
  tier: 'free' | 'pro';
  audioUrl: string;
}

export interface UserContentHistory {
  id: string;
  userId: string;
  contentId: string;
  playedAt: string;
  completionPercent: number;
  sessionId: string | null;
  resultingScore: number | null;
}

export interface Insight {
  id: string;
  sessionId: string;
  type: 'disruption_cause' | 'pattern' | 'recommendation' | 'experiment_result' | 'encouragement';
  title: string;
  body: string;
  confidence: number;
  relatedEventIds: string[];
}

export interface Pattern {
  id: string;
  userId: string;
  type: 'recurring_noise' | 'temperature_trend' | 'weekly_cycle' | 'content_correlation';
  description: string;
  occurrences: number;
  dayOfWeek?: number[];
  timeRange?: { start: string; end: string };
  avgImpactScore: number;
  firstDetected: string;
  lastSeen: string;
}

export interface Experiment {
  id: string;
  userId: string;
  name: string;
  hypothesis: string;
  targetMetric: string;
  baselineValue: number;
  currentValue: number | null;
  totalNights: number;
  completedNights: number;
  status: 'active' | 'complete' | 'abandoned';
  improvementPct: number | null;
  resultSummary: string | null;
  startedAt: string;
  completedAt: string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro';
  timezone: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  bedtimeGoal: string;
  wakeGoal: string;
  tempUnitF: boolean;
  thermostatSetting?: number;
  sensitivityLevel: 'low' | 'medium' | 'high';
  partnerDefault: boolean;
  adaptiveSoundEnabled: boolean;
  smartFadeEnabled: boolean;
}

/** Content environment types for immersive visuals */
export type VisualEnvironment =
  | 'rain'
  | 'ocean'
  | 'forest'
  | 'city_night'
  | 'white_noise'
  | 'sleep_story'
  | 'breathing'
  | 'meditation'
  | 'default';

/** Event severity with display info */
export interface SeverityInfo {
  label: string;
  weight: number;
}

export const SEVERITY_MAP: Record<string, SeverityInfo> = {
  low: { label: 'Low', weight: 1 },
  medium: { label: 'Medium', weight: 2 },
  high: { label: 'High', weight: 3 },
};
