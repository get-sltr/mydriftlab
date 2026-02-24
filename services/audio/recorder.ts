/**
 * Audio capture manager for DriftLab
 * Handles microphone recording and dB level monitoring
 * All audio processing happens on-device - raw audio never leaves the phone
 */

import { Audio } from 'expo-av';

export interface AudioLevel {
  timestamp: number;
  decibelLevel: number;
  isAboveBaseline: boolean;
}

export interface RecorderState {
  isRecording: boolean;
  currentDb: number;
  baselineDb: number;
  elapsedSeconds: number;
}

// Placeholder - full implementation in Step 6
export class AudioRecorder {
  private recording: Audio.Recording | null = null;
  private baselineDb = 30;

  async start(): Promise<void> {
    // TODO: Implement in Step 6
  }

  async stop(): Promise<void> {
    // TODO: Implement in Step 6
  }

  getCurrentLevel(): number {
    return this.baselineDb;
  }
}
