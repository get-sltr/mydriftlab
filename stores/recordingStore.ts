/**
 * Recording store — Zustand
 * Central orchestrator for night monitoring sessions.
 * Manages audio recording, rule engine, sensors, and smart fade.
 *
 * Service instances live outside Zustand state (module-level variables)
 * since they're non-serializable.
 */

import { create } from 'zustand';
import type {
  EnvironmentEvent,
  BreathTrendSummary,
  SleepEfficiencyData,
  SonarState,
} from '../lib/types';
import { AudioRecorder } from '../services/audio/recorder';
import { ClipKeeper } from '../services/audio/clipKeeper';
import { RuleEngine } from '../services/audio/ruleEngine';
import { SonarTracker } from '../services/audio/sonar';
import { BreathTrendAnalyzer } from '../services/analysis/breathTrend';
import { SensorManager } from '../services/sensors/SensorManager';
import {
  createSmartFadeState,
  checkSmartFade,
  recordInteraction,
  type SmartFadeState,
} from '../services/audio/smartfade';
import { createSession, updateSession } from '../services/aws/sessions';
import { createEvent } from '../services/aws/events';
import { calculateRestScore } from '../services/analysis/scoring';
import { writeNightSummary } from '../services/analysis/summaryWriter';
import * as AppleHealth from '../services/health/appleHealth';
import { scheduleClipExpiryReminder } from '../services/notifications/clipReminder';

export type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping' | 'error';

interface RecordingState {
  sessionId: string | null;
  status: RecordingStatus;
  currentDb: number;
  baselineDb: number;
  events: Partial<EnvironmentEvent>[];
  recentToastEvent: Partial<EnvironmentEvent> | null;
  elapsedSeconds: number;
  temperatureF: number | null;
  smartFadeTriggered: boolean;
  error: string | null;

  // Sonar + BreathTrend + Apple Health state
  breathTrend: BreathTrendSummary | null;
  sleepEfficiency: SleepEfficiencyData | null;
  sonarState: SonarState | null;

  startSession: (
    userId: string,
    token: string,
    sensitivity: 'low' | 'medium' | 'high',
    thermostatF?: number,
    sonarEnabled?: boolean,
    appleHealthEnabled?: boolean,
  ) => Promise<void>;
  stopSession: (token: string, appleHealthEnabled?: boolean) => Promise<void>;
  recordUserInteraction: () => void;
  dismissToast: () => void;
}

// Module-level service instances (non-serializable, outside Zustand)
let recorder: AudioRecorder | null = null;
let clipKeeper: ClipKeeper | null = null;
let ruleEngine: RuleEngine | null = null;
let sensorManager: SensorManager | null = null;
let sonarTracker: SonarTracker | null = null;
let breathTrendAnalyzer: BreathTrendAnalyzer | null = null;
let smartFadeState: SmartFadeState | null = null;
let analysisTimer: ReturnType<typeof setInterval> | null = null;
let elapsedTimer: ReturnType<typeof setInterval> | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (analysisTimer) { clearInterval(analysisTimer); analysisTimer = null; }
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null; }
  if (toastTimer) { clearTimeout(toastTimer); toastTimer = null; }
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  sessionId: null,
  status: 'idle',
  currentDb: 0,
  baselineDb: 30,
  events: [],
  recentToastEvent: null,
  elapsedSeconds: 0,
  temperatureF: null,
  smartFadeTriggered: false,
  error: null,
  breathTrend: null,
  sleepEfficiency: null,
  sonarState: null,

  startSession: async (userId, token, sensitivity, thermostatF, sonarEnabled = true, appleHealthEnabled = false) => {
    const { status } = get();
    if (status !== 'idle') return;

    set({ status: 'starting', error: null, events: [], elapsedSeconds: 0, smartFadeTriggered: false });

    try {
      // Create backend session
      const session = await createSession(token, {
        userId,
        status: 'recording',
        startedAt: new Date().toISOString(),
      });

      const sessionId = session.id;

      // Initialize services
      recorder = new AudioRecorder();
      ruleEngine = new RuleEngine(sensitivity);
      sensorManager = new SensorManager();
      smartFadeState = createSmartFadeState();

      // Initialize ClipKeeper for segment storage
      const dateStr = new Date().toISOString().split('T')[0];
      clipKeeper = new ClipKeeper(sessionId, dateStr);
      await clipKeeper.init();

      // Initialize Sonar + BreathTrend
      breathTrendAnalyzer = new BreathTrendAnalyzer();
      if (sonarEnabled) {
        sonarTracker = new SonarTracker();
        sonarTracker.onStateChange((state) => {
          set({ sonarState: state });
        });
        await sonarTracker.start();
      }

      // Start audio recording with level callback + segment rotation
      await recorder.start(
        (level) => {
          set({ currentDb: level.splDb });
          // Feed metering data to BreathTrend and Sonar
          breathTrendAnalyzer?.pushSample(level.splDb);
          sonarTracker?.pushSample(level.splDb);
        },
        (uri, startTime, endTime) => {
          // Segment complete — hand off to ClipKeeper
          clipKeeper?.receiveSegment(uri, startTime, endTime).catch(() => {});
        },
      );

      // Start sensors
      await sensorManager.start(sessionId, (event) => {
        handleEvent(event, token);
      }, thermostatF);

      set({
        sessionId,
        status: 'recording',
        temperatureF: thermostatF ?? null,
      });

      // 1Hz analysis loop
      analysisTimer = setInterval(() => {
        if (!recorder || !ruleEngine) return;
        const { sessionId: sid } = get();
        if (!sid) return;

        const recentLevels = recorder.buffer.getLast(300); // Last 30s at 10Hz
        const baseline = recorder.getBaselineDb();
        set({ baselineDb: baseline });

        const detectedEvents = ruleEngine.analyze(recentLevels, baseline, sid);
        for (const event of detectedEvents) {
          handleEvent(event, token);
        }

        // Check smart fade
        if (smartFadeState) {
          const shouldFade = checkSmartFade(smartFadeState, recorder.getCurrentDb(), baseline);
          if (shouldFade) {
            set({ smartFadeTriggered: true });
          }
        }
      }, 1000);

      // 1Hz elapsed timer
      elapsedTimer = setInterval(() => {
        set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 }));
      }, 1000);
    } catch (err: any) {
      set({ status: 'error', error: err?.message ?? 'Failed to start session' });
      // Cleanup on failure
      await recorder?.stop().catch(() => {});
      await sensorManager?.stop().catch(() => {});
      await sonarTracker?.stop().catch(() => {});
      clearTimers();
      recorder = null;
      ruleEngine = null;
      sensorManager = null;
      sonarTracker = null;
      breathTrendAnalyzer = null;
    }
  },

  stopSession: async (token, appleHealthEnabled = false) => {
    const { status, sessionId } = get();
    if (status !== 'recording' || !sessionId) return;

    set({ status: 'stopping' });

    clearTimers();

    // Finalize BreathTrend and Sonar before stopping services
    const breathTrendSummary = breathTrendAnalyzer?.finalize() ?? null;
    const sleepEfficiencyData = sonarTracker?.getSleepEfficiency() ?? null;

    // Stop services
    await recorder?.stop().catch(() => {});
    await sensorManager?.stop().catch(() => {});
    await sonarTracker?.stop().catch(() => {});
    await clipKeeper?.finalize().catch(() => {});

    recorder = null;
    clipKeeper = null;
    ruleEngine = null;
    sensorManager = null;
    sonarTracker = null;
    breathTrendAnalyzer = null;
    smartFadeState = null;

    // Compute score and summary from accumulated events
    const { events, elapsedSeconds } = get();
    const fullEvents = events.filter(
      (e): e is EnvironmentEvent => !!e.id && !!e.sessionId,
    );
    const restScore = calculateRestScore(fullEvents, false);
    const durationMinutes = Math.round(elapsedSeconds / 60);
    const nightSummary = writeNightSummary(fullEvents, durationMinutes, restScore);

    // Store breath trend and sleep efficiency in state
    set({
      breathTrend: breathTrendSummary,
      sleepEfficiency: sleepEfficiencyData,
    });

    // Update backend session with score + summary
    try {
      await updateSession(token, sessionId, {
        status: 'complete',
        endedAt: new Date().toISOString(),
        restScore,
        nightSummary,
      });
    } catch {
      // Non-critical — session can be closed later
    }

    // Apple Health integration (if enabled)
    if (appleHealthEnabled) {
      try {
        const sessionStart = new Date(
          Date.now() - elapsedSeconds * 1000,
        );
        const sessionEnd = new Date();

        // Write sleep session to HealthKit
        await AppleHealth.writeSleepSession(sessionStart, sessionEnd);
      } catch {
        // Apple Health write failure is non-critical
      }
    }

    // Schedule day-10 clip expiry reminder if clips were kept
    const clipCount = fullEvents.length; // clips are kept for events
    if (clipCount > 0) {
      const dateStr = new Date().toISOString();
      scheduleClipExpiryReminder(dateStr, sessionId, clipCount).catch(() => {});
    }

    set({ status: 'idle', sessionId: null });
  },

  recordUserInteraction: () => {
    if (smartFadeState) {
      recordInteraction(smartFadeState);
      set({ smartFadeTriggered: false });
    }
  },

  dismissToast: () => {
    set({ recentToastEvent: null });
  },
}));

/** Handle a detected event — add to store and persist to backend */
function handleEvent(event: Partial<EnvironmentEvent>, token: string) {
  useRecordingStore.setState((s) => ({
    events: [...s.events, event],
    recentToastEvent: event,
  }));

  // Flag the current clip segment so it's kept (not discarded)
  if (event.id && clipKeeper) {
    clipKeeper.flagCurrentSegment(event.id);
  }

  // Auto-dismiss toast after 5s
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    useRecordingStore.setState({ recentToastEvent: null });
  }, 5000);

  // Fire-and-forget backend persistence
  createEvent(token, event).catch(() => {});
}
