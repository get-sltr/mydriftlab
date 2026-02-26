/**
 * MyDriftLAB Core Data Types
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
  description?: string;
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

// ── Weekly Report types ──────────────────────────────────────

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  avgScore: number;
  prevWeekAvgScore: number | null;
  dailyBreakdowns: DailyBreakdown[];
  patterns: PatternInsight[];
  topRecommendation: string;
}

export interface DailyBreakdown {
  date: string;
  dayLabel: string;
  score: number | null;
  explanation: string;
  topDisruptor: string | null;
}

export interface PatternInsight {
  title: string;
  body: string;
  category: 'noise' | 'climate' | 'light' | 'partner' | 'general';
  impact: 'positive' | 'negative' | 'neutral';
}

// ── BreathTrend types ────────────────────────────────────────

export type BreathingPhase = 'quiet' | 'active' | 'disturbed';

export interface BreathingSnapshot {
  timestamp: string;
  breathingRate: number;
  regularity: number;
  avgAmplitude: number;
  disturbanceDetected: boolean;
}

export interface BreathTrendSummary {
  avgBreathingRate: number;
  minBreathingRate: number;
  maxBreathingRate: number;
  avgRegularity: number;
  disturbanceCount: number;
  disturbanceMinutes: number;
  bdi: number;
  bdiSeverity: 'normal' | 'mild' | 'moderate' | 'severe';
  recordingHours: number;
  phases: { phase: BreathingPhase; startTime: string; endTime: string }[];
  snapshots: BreathingSnapshot[];
}

// ── Sonar types ──────────────────────────────────────────────

export type MovementLevel = 'still' | 'minor' | 'major' | 'absent';
export type SonarSleepState = 'awake' | 'light' | 'deep';

export interface SonarState {
  breathingRate: number;
  movementLevel: MovementLevel;
  sleepState: SonarSleepState;
  lastMovementAt: string | null;
}

export interface MovementSample {
  timestamp: string;
  movementLevel: MovementLevel;
  sleepState: SonarSleepState;
}

export interface SleepEfficiencyData {
  totalTimeInBedMinutes: number;
  totalSleepMinutes: number;
  sleepOnsetLatencyMinutes: number;
  wakeAfterSleepOnsetMinutes: number;
  sleepEfficiency: number;
  movementTimeline: MovementSample[];
}

// ── CBT-I types ──────────────────────────────────────────────

export interface CBTIProgram {
  id: string;
  userId: string;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  startedAt: string;
  currentWeek: number;
  baselineSleepEfficiency: number;
  currentSleepEfficiency: number;
  prescribedBedtime: string;
  prescribedWakeTime: string;
  timeInBedMinutes: number;
  sleepDiary: SleepDiaryEntry[];
}

export interface CBTIWeek {
  week: number;
  focus: string;
  keyAction: string;
}

export interface SleepDiaryEntry {
  date: string;
  sessionId: string | null;
  bedtime: string;
  lightsOff: string;
  sleepOnsetMinutes: number;
  awakenings: number;
  wakeMinutes: number;
  finalWake: string;
  outOfBed: string;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  notes: string;
  timeInBed: number;
  totalSleepTime: number;
  efficiency: number;
  sonarEfficiency: number | null;
  sonarSleepMinutes: number | null;
}

// ── Remedy types ─────────────────────────────────────────────

export type RemedyCategory =
  | 'positional'
  | 'environmental'
  | 'behavioral'
  | 'device'
  | 'dietary'
  | 'exercise';

export type EvidenceLevel = 'strong' | 'moderate' | 'emerging';

export interface MatchRule {
  metric: string;
  condition: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
  value: number;
}

export interface Remedy {
  id: string;
  name: string;
  category: RemedyCategory;
  description: string;
  howTo: string;
  evidenceLevel: EvidenceLevel;
  source: string;
  targetMetrics: string[];
  matchRules: MatchRule[];
  experimentDuration: number;
  disclaimer: string | null;
}

export interface RemedySuggestion {
  remedy: Remedy;
  priority: number;
  reason: string;
}

// ── Experiment types ─────────────────────────────────────────

export type ExperimentAdherence = 'full' | 'partial' | 'skipped';

export interface ExperimentLog {
  date: string;
  adherence: ExperimentAdherence;
  notes: string;
  restScore: number | null;
  bdi: number | null;
  sleepEfficiency: number | null;
}

export interface ExperimentResults {
  baselineAvgScore: number;
  experimentAvgScore: number;
  baselineAvgBdi: number | null;
  experimentAvgBdi: number | null;
  baselineAvgEfficiency: number | null;
  experimentAvgEfficiency: number | null;
  verdict: 'improved' | 'no_change' | 'worsened';
  improvementPct: number;
}

// ── Apple Health types ───────────────────────────────────────

export interface AppleHealthSleepData {
  sleepStages: {
    awake: number;
    rem: number;
    core: number;
    deep: number;
  };
  totalSleepMinutes: number;
  hrv: number | null;
  respiratoryRate: number | null;
  spo2: number | null;
  heartRate: { avg: number; min: number; max: number } | null;
}

// ── CBT-I content types ─────────────────────────────────────

export type CBTILessonType = 'education' | 'exercise' | 'reflection';

export interface CBTILesson {
  id: string;
  week: number;
  title: string;
  body: string;
  audioId: string | null;
  estimatedMinutes: number;
  type: CBTILessonType;
}

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
