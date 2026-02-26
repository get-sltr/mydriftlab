/**
 * BreathingMonitor — detects sleep onset via breathing rate analysis.
 *
 * Uses expo-av Recording with metering (dB levels at 10 Hz) to capture
 * ambient sound. Breathing creates periodic rises/falls in amplitude.
 * Autocorrelation finds the dominant cycle; when breathing slows below
 * ~14 bpm and becomes regular for 2+ consecutive 30-second windows,
 * we signal sleep onset.
 *
 * Primary use case: earbuds/AirPods. The earbud mic sits inches from
 * the user's nose and mouth, giving a strong breathing signal with high
 * SNR even while content audio plays through the earpiece. This lets us
 * use tighter detection thresholds and get reliable readings.
 */

import { Audio } from 'expo-av';

// ── Configuration ──────────────────────────────────────────────────

const SAMPLE_RATE_HZ = 10; // metering poll rate
const SAMPLE_INTERVAL_MS = 1000 / SAMPLE_RATE_HZ; // 100ms
const ANALYSIS_WINDOW_S = 30;
const SAMPLES_PER_WINDOW = ANALYSIS_WINDOW_S * SAMPLE_RATE_HZ; // 300

/** Breaths per minute — below this we consider "sleep breathing" */
const SLEEP_ONSET_BPM = 14;
/** Autocorrelation strength threshold (0–1). Earbud mic proximity
 *  gives clean signal, so we can set this relatively tight. */
const REGULARITY_THRESHOLD = 0.4;
/** How many consecutive sleep-like windows before we declare onset */
const CONSECUTIVE_WINDOWS_NEEDED = 2;

// Breathing range: 8–24 bpm → periods 2.5s–7.5s → lags 25–75 at 10 Hz
const MIN_LAG = Math.floor((SAMPLE_RATE_HZ * 60) / 24); // ~25
const MAX_LAG = Math.ceil((SAMPLE_RATE_HZ * 60) / 8); // ~75

// ── Types ──────────────────────────────────────────────────────────

export interface BreathingState {
  /** Detected breaths per minute (0 = no clear signal) */
  rate: number;
  /** Regularity of the breathing pattern, 0–1 */
  regularity: number;
  /** True once sleep-like breathing sustained for required windows */
  sleepOnsetDetected: boolean;
}

export type BreathingCallback = (state: BreathingState) => void;

// ── Class ──────────────────────────────────────────────────────────

export class BreathingMonitor {
  private recording: Audio.Recording | null = null;
  private meteringBuffer: number[] = [];
  private callback: BreathingCallback | null = null;
  private analysisTimer: ReturnType<typeof setInterval> | null = null;
  private consecutiveSleepWindows = 0;
  private running = false;

  /** Register a callback that fires every analysis window (~30 s). */
  onStateChange(cb: BreathingCallback): void {
    this.callback = cb;
  }

  /** Start background metering. Call after ContentPlayer.init(). */
  async start(): Promise<void> {
    if (this.running) return;

    // Enable recording alongside playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      isMeteringEnabled: true,
      android: {
        extension: '.3gp',
        outputFormat: Audio.AndroidOutputFormat.THREE_GPP,
        audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
        sampleRate: 8000,
        numberOfChannels: 1,
        bitRate: 12200,
      },
      ios: {
        extension: '.caf',
        audioQuality: Audio.IOSAudioQuality.MIN,
        sampleRate: 8000,
        numberOfChannels: 1,
        bitRate: 12200,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: { mimeType: 'audio/webm', bitsPerSecond: 12200 },
    });

    recording.setProgressUpdateInterval(SAMPLE_INTERVAL_MS);
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.metering !== undefined) {
        this.meteringBuffer.push(status.metering);
        // Keep buffer bounded (2 windows)
        if (this.meteringBuffer.length > SAMPLES_PER_WINDOW * 2) {
          this.meteringBuffer = this.meteringBuffer.slice(-SAMPLES_PER_WINDOW);
        }
      }
    });

    await recording.startAsync();
    this.recording = recording;
    this.running = true;
    this.consecutiveSleepWindows = 0;

    // Run analysis every window
    this.analysisTimer = setInterval(
      () => this.analyze(),
      ANALYSIS_WINDOW_S * 1000,
    );
  }

  /** Stop monitoring and clean up the temp recording file. */
  async stop(): Promise<void> {
    if (!this.running) return;
    this.running = false;

    if (this.analysisTimer) {
      clearInterval(this.analysisTimer);
      this.analysisTimer = null;
    }

    if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // already stopped
      }
      this.recording = null;
    }

    // Restore audio mode for playback-only (no recording)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    });

    this.meteringBuffer = [];
    this.consecutiveSleepWindows = 0;
  }

  /** Reset the sleep-onset counter (e.g. user interacted with screen). */
  resetOnset(): void {
    this.consecutiveSleepWindows = 0;
  }

  // ── Analysis ───────────────────────────────────────────────────

  private analyze(): void {
    // Need at least 80% of a window to analyze
    if (this.meteringBuffer.length < SAMPLES_PER_WINDOW * 0.8) return;

    const raw = this.meteringBuffer.slice(-SAMPLES_PER_WINDOW);

    // 1. Normalize (zero-mean)
    const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
    const centered = raw.map((v) => v - mean);

    // 2. Smooth with 5-sample (~500 ms) moving average
    const smoothed = movingAverage(centered, 5);

    // 3. Autocorrelation to find dominant breathing cycle
    const { rate, regularity } = findBreathingRate(smoothed);

    // 4. Evaluate sleep onset
    const looksLikeSleep =
      rate > 0 && rate < SLEEP_ONSET_BPM && regularity > REGULARITY_THRESHOLD;

    if (looksLikeSleep) {
      this.consecutiveSleepWindows++;
    } else {
      this.consecutiveSleepWindows = 0;
    }

    this.callback?.({
      rate: Math.round(rate * 10) / 10,
      regularity: Math.round(regularity * 100) / 100,
      sleepOnsetDetected:
        this.consecutiveSleepWindows >= CONSECUTIVE_WINDOWS_NEEDED,
    });
  }
}

// ── DSP helpers ──────────────────────────────────────────────────

function movingAverage(data: number[], window: number): number[] {
  const half = Math.floor(window / 2);
  const out: number[] = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const lo = Math.max(0, i - half);
    const hi = Math.min(data.length - 1, i + half);
    let sum = 0;
    for (let j = lo; j <= hi; j++) sum += data[j];
    out[i] = sum / (hi - lo + 1);
  }
  return out;
}

function findBreathingRate(samples: number[]): {
  rate: number;
  regularity: number;
} {
  const n = samples.length;

  // Energy normalization
  let energy = 0;
  for (let i = 0; i < n; i++) energy += samples[i] * samples[i];
  if (energy === 0) return { rate: 0, regularity: 0 };

  // Find best lag via autocorrelation
  let bestLag = 0;
  let bestCorr = -Infinity;

  for (let lag = MIN_LAG; lag <= MAX_LAG && lag < n; lag++) {
    let corr = 0;
    for (let i = 0; i < n - lag; i++) {
      corr += samples[i] * samples[i + lag];
    }
    corr /= energy; // normalize to 0–1 range
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag === 0 || bestCorr < 0.15) {
    return { rate: 0, regularity: 0 };
  }

  const rate = (SAMPLE_RATE_HZ * 60) / bestLag;
  const regularity = Math.max(0, Math.min(1, bestCorr));

  return { rate, regularity };
}
