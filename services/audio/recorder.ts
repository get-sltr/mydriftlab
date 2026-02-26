/**
 * Audio capture manager for DriftLab
 * Handles microphone recording and dB level monitoring.
 * All audio processing happens on-device — raw audio NEVER leaves the phone.
 *
 * Uses expo-av Recording with metering enabled at 100ms intervals.
 * Only numeric metering values are extracted — no audio samples in state or API.
 */

import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import { CircularBuffer } from '../../lib/CircularBuffer';

export interface AudioLevel {
  timestamp: number;
  dBFS: number;
  splDb: number;
  isAboveBaseline: boolean;
}

export type RecorderState = 'idle' | 'starting' | 'recording' | 'stopping';

export type LevelCallback = (level: AudioLevel) => void;

export type SegmentCompleteCallback = (
  uri: string,
  startTime: number,
  endTime: number,
) => void;

// EMA smoothing alpha — 0.3 gives ~700ms convergence at 100ms intervals
const EMA_ALPHA = 0.3;
// dBFS to approximate SPL offset (rough calibration for typical phone mics)
const DBFS_TO_SPL_OFFSET = 120;
// Baseline recalculation interval
const BASELINE_INTERVAL_MS = 60_000;
// Buffer capacity: 6,000 entries = ~10 min at 10Hz
const BUFFER_CAPACITY = 6000;
// Segment rotation: 5 minutes per segment
const SEGMENT_DURATION_MS = 5 * 60 * 1000;

export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private statusInterval: ReturnType<typeof setInterval> | null = null;
  private baselineInterval: ReturnType<typeof setInterval> | null = null;
  private segmentTimer: ReturnType<typeof setInterval> | null = null;
  private state: RecorderState = 'idle';
  private smoothedDbs = -160;
  private baselineDb = 30;
  private onLevelUpdate: LevelCallback | null = null;
  private onSegmentComplete: SegmentCompleteCallback | null = null;
  private segmentStartTime = 0;
  private isRotating = false;

  readonly buffer = new CircularBuffer<AudioLevel>(BUFFER_CAPACITY);

  getState(): RecorderState {
    return this.state;
  }

  getCurrentDb(): number {
    return Math.max(0, Math.round(this.smoothedDbs));
  }

  getBaselineDb(): number {
    return this.baselineDb;
  }

  async start(
    onLevelUpdate?: LevelCallback,
    onSegmentComplete?: SegmentCompleteCallback,
  ): Promise<void> {
    if (this.state !== 'idle') return;
    this.state = 'starting';
    this.onLevelUpdate = onLevelUpdate ?? null;
    this.onSegmentComplete = onSegmentComplete ?? null;

    // Request permissions
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      this.state = 'idle';
      throw new Error('Microphone permission denied');
    }

    // Set audio mode for background recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      playsInSilentModeIOS: true,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
    });

    // Create recording — mono, 64kbps AAC, metering enabled
    const { recording } = await Audio.Recording.createAsync(
      {
        isMeteringEnabled: true,
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 22050,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
          sampleRate: 22050,
          numberOfChannels: 1,
          bitRate: 64000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 64000,
        },
      },
      undefined,
      100, // status update interval: 100ms
    );

    this.recording = recording;
    this.state = 'recording';
    this.smoothedDbs = -160;
    this.buffer.clear();
    this.segmentStartTime = Date.now();

    // Poll metering at ~100ms via status polling
    this.statusInterval = setInterval(() => this.pollMetering(), 100);

    // Recalculate baseline every 60s using 20th percentile
    this.baselineInterval = setInterval(() => this.recalculateBaseline(), BASELINE_INTERVAL_MS);

    // Initial baseline after 5s
    setTimeout(() => this.recalculateBaseline(), 5000);

    // Segment rotation every 5 minutes
    if (this.onSegmentComplete) {
      this.segmentTimer = setInterval(() => this.rotateSegment(), SEGMENT_DURATION_MS);
    }
  }

  async stop(): Promise<void> {
    if (this.state !== 'recording') return;
    this.state = 'stopping';

    // Clear timers
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
    if (this.baselineInterval) {
      clearInterval(this.baselineInterval);
      this.baselineInterval = null;
    }
    if (this.segmentTimer) {
      clearInterval(this.segmentTimer);
      this.segmentTimer = null;
    }

    // Emit final segment before stopping
    if (this.recording && this.onSegmentComplete) {
      try {
        const uri = this.recording.getURI();
        const endTime = Date.now();
        await this.recording.stopAndUnloadAsync();
        if (uri) {
          this.onSegmentComplete(uri, this.segmentStartTime, endTime);
        }
      } catch {
        // Recording may already be stopped
      }
      this.recording = null;
    } else if (this.recording) {
      try {
        await this.recording.stopAndUnloadAsync();
      } catch {
        // Recording may already be stopped
      }
      this.recording = null;
    }

    // Reset audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    });

    this.onLevelUpdate = null;
    this.onSegmentComplete = null;
    this.state = 'idle';
  }

  private async pollMetering(): Promise<void> {
    if (!this.recording || this.state !== 'recording') return;

    try {
      const status = await this.recording.getStatusAsync();
      if (!status.isRecording || status.metering === undefined) return;

      const rawDbfs = status.metering; // -160 to 0
      const splDb = rawDbfs + DBFS_TO_SPL_OFFSET;

      // EMA smoothing
      this.smoothedDbs =
        this.smoothedDbs <= -150
          ? splDb
          : EMA_ALPHA * splDb + (1 - EMA_ALPHA) * this.smoothedDbs;

      const level: AudioLevel = {
        timestamp: Date.now(),
        dBFS: rawDbfs,
        splDb: Math.max(0, Math.round(this.smoothedDbs)),
        isAboveBaseline: this.smoothedDbs > this.baselineDb + 5,
      };

      this.buffer.push(level);
      this.onLevelUpdate?.(level);
    } catch {
      // Status polling can fail during lifecycle transitions
    }
  }

  private async rotateSegment(): Promise<void> {
    if (!this.recording || this.state !== 'recording' || this.isRotating) return;
    this.isRotating = true;

    try {
      const uri = this.recording.getURI();
      const endTime = Date.now();

      // Stop current recording
      await this.recording.stopAndUnloadAsync();

      // Emit completed segment
      if (uri && this.onSegmentComplete) {
        this.onSegmentComplete(uri, this.segmentStartTime, endTime);
      }

      // Start new recording (same config)
      const { recording } = await Audio.Recording.createAsync(
        {
          isMeteringEnabled: true,
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 22050,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.MEDIUM,
            sampleRate: 22050,
            numberOfChannels: 1,
            bitRate: 64000,
          },
          web: {
            mimeType: 'audio/webm',
            bitsPerSecond: 64000,
          },
        },
        undefined,
        100,
      );

      this.recording = recording;
      this.segmentStartTime = Date.now();
    } catch {
      // Rotation failure — recording may have been interrupted
    } finally {
      this.isRotating = false;
    }
  }

  private recalculateBaseline(): void {
    if (this.buffer.size < 50) return; // Need minimum data
    // 20th percentile — representative of quiet baseline
    this.baselineDb = this.buffer.percentile(20, (l) => l.splDb);
  }
}
