/**
 * Content playback manager for MyDriftLAB.
 *
 * Smart Fade — breathing-aware volume fadeout:
 * BreathingMonitor detects when the user's breathing slows and
 * stabilizes (sleep onset). Once detected, volume fades linearly
 * from current level → 0 over FADE_DURATION_MS. If the user wakes
 * (interacts with screen), the fade cancels and volume restores.
 */

import { Audio, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { BreathingMonitor } from './breathingMonitor';

/** How long the volume fade lasts once sleep onset is detected */
const FADE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
/** How long the volume restore takes when the user wakes */
const RESTORE_DURATION_MS = 30 * 1000; // 30 seconds
/** Volume update interval during fade/restore */
const FADE_TICK_MS = 3000; // every 3 s

export type PlaybackStatusCallback = (status: {
  positionMillis: number;
  durationMillis: number;
  isPlaying: boolean;
  didJustFinish: boolean;
}) => void;

export type SmartFadeCallback = (state: {
  /** True while the volume is actively fading */
  isFading: boolean;
  /** Current volume 0–1 during fade */
  volume: number;
  /** ISO timestamp when fade started, or null */
  smartFadeAt: string | null;
}) => void;

export type FadeCompleteCallback = () => void;

export class ContentPlayer {
  private sound: Audio.Sound | null = null;
  private statusCallback: PlaybackStatusCallback | null = null;
  private fadeCallback: SmartFadeCallback | null = null;
  private fadeCompleteCallback: FadeCompleteCallback | null = null;
  private totalDurationMs = 0;

  // Smart Fade state
  private smartFadeEnabled = true;
  private breathingMonitor: BreathingMonitor | null = null;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private restoreTimer: ReturnType<typeof setInterval> | null = null;
  private fadeStartTime = 0;
  private isFading = false;
  private isRestoring = false;
  private smartFadeAt: string | null = null;
  private currentVolume = 1.0;

  /** Configure audio mode for background playback */
  async init(): Promise<void> {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
    });
  }

  /** Register a callback for playback status updates */
  onStatus(callback: PlaybackStatusCallback): void {
    this.statusCallback = callback;
  }

  /** Register a callback for Smart Fade state changes */
  onSmartFade(callback: SmartFadeCallback): void {
    this.fadeCallback = callback;
  }

  /** Register a callback for when Smart Fade completes (volume reaches 0) */
  onFadeComplete(callback: FadeCompleteCallback): void {
    this.fadeCompleteCallback = callback;
  }

  /** Enable or disable Smart Fade (default: enabled) */
  setSmartFade(enabled: boolean): void {
    this.smartFadeEnabled = enabled;
    if (!enabled) this.cancelFade();
  }

  /**
   * Load audio from a bundled require() asset or a remote URI.
   * Does not auto-play — call play() after loading.
   */
  async load(source: number | { uri: string }): Promise<void> {
    await this.unload();

    const { sound } = await Audio.Sound.createAsync(source, {
      shouldPlay: false,
      volume: 1.0,
    });

    this.sound = sound;
    this.sound.setOnPlaybackStatusUpdate(this.handleStatus);
  }

  async play(): Promise<void> {
    if (!this.sound) return;
    this.currentVolume = 1.0;
    await this.sound.setVolumeAsync(1.0);
    await this.sound.playAsync();

    // Start breathing monitor for Smart Fade
    if (this.smartFadeEnabled) {
      await this.startBreathingMonitor();
    }
  }

  async pause(): Promise<void> {
    if (!this.sound) return;
    await this.sound.pauseAsync();
  }

  async resume(): Promise<void> {
    if (!this.sound) return;
    await this.sound.playAsync();
  }

  async stop(): Promise<void> {
    if (!this.sound) return;
    this.cancelFade();
    this.cancelRestore();
    await this.stopBreathingMonitor();
    await this.sound.stopAsync();
    await this.unload();
  }

  async seekTo(positionMillis: number): Promise<void> {
    if (!this.sound) return;
    await this.sound.setPositionAsync(Math.max(0, positionMillis));
  }

  /**
   * Call when the user interacts (screen tap, skip, etc.).
   * Cancels any in-progress fade and gradually restores volume
   * over 30 seconds so it's not jarring for a groggy user.
   */
  async onUserInteraction(): Promise<void> {
    if (this.isFading || this.currentVolume < 1.0) {
      this.cancelFade();
      this.beginRestore();
    }
    // Reset breathing onset counter — they're clearly awake
    this.breathingMonitor?.resetOnset();
  }

  /** The ISO timestamp when Smart Fade was triggered, for session data */
  getSmartFadeAt(): string | null {
    return this.smartFadeAt;
  }

  async unload(): Promise<void> {
    this.cancelFade();
    this.cancelRestore();
    await this.stopBreathingMonitor();
    if (this.sound) {
      this.sound.setOnPlaybackStatusUpdate(null);
      try {
        await this.sound.unloadAsync();
      } catch {
        // already unloaded
      }
      this.sound = null;
    }
    this.totalDurationMs = 0;
    this.smartFadeAt = null;
  }

  // ── Breathing monitor ────────────────────────────────────────

  private async startBreathingMonitor(): Promise<void> {
    if (this.breathingMonitor) return;

    const monitor = new BreathingMonitor();
    monitor.onStateChange((state) => {
      if (state.sleepOnsetDetected && !this.isFading) {
        this.beginFade();
      }
    });

    this.breathingMonitor = monitor;
    await monitor.start();
  }

  private async stopBreathingMonitor(): Promise<void> {
    if (!this.breathingMonitor) return;
    await this.breathingMonitor.stop();
    this.breathingMonitor = null;
  }

  // ── Smart Fade engine ────────────────────────────────────────

  private beginFade(): void {
    if (this.isFading) return;

    this.isFading = true;
    this.fadeStartTime = Date.now();
    this.smartFadeAt = new Date().toISOString();
    this.emitFadeState();

    this.fadeTimer = setInterval(() => {
      const elapsed = Date.now() - this.fadeStartTime;
      const progress = Math.min(1, elapsed / FADE_DURATION_MS);
      this.currentVolume = Math.max(0, 1 - progress);

      this.sound?.setVolumeAsync(this.currentVolume).catch(() => {});
      this.emitFadeState();

      // Fade complete
      if (progress >= 1) {
        this.cancelFade();
        // Pause playback at zero volume — audio is done
        this.sound?.pauseAsync().catch(() => {});
        // Stop breathing monitor — no longer needed
        this.stopBreathingMonitor().catch(() => {});
        // Notify listener (e.g. to start recording handoff)
        this.fadeCompleteCallback?.();
      }
    }, FADE_TICK_MS);
  }

  private cancelFade(): void {
    if (this.fadeTimer) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    this.isFading = false;
  }

  private beginRestore(): void {
    this.cancelRestore();
    this.isRestoring = true;
    const startVolume = this.currentVolume;
    const restoreStart = Date.now();

    this.restoreTimer = setInterval(() => {
      const elapsed = Date.now() - restoreStart;
      const progress = Math.min(1, elapsed / RESTORE_DURATION_MS);
      this.currentVolume = startVolume + (1.0 - startVolume) * progress;

      this.sound?.setVolumeAsync(this.currentVolume).catch(() => {});
      this.emitFadeState();

      if (progress >= 1) {
        this.cancelRestore();
      }
    }, FADE_TICK_MS);

    this.emitFadeState();
  }

  private cancelRestore(): void {
    if (this.restoreTimer) {
      clearInterval(this.restoreTimer);
      this.restoreTimer = null;
    }
    this.isRestoring = false;
  }

  private emitFadeState(): void {
    this.fadeCallback?.({
      isFading: this.isFading,
      volume: this.currentVolume,
      smartFadeAt: this.smartFadeAt,
    });
  }

  // ── Playback status ──────────────────────────────────────────

  private handleStatus = (status: AVPlaybackStatus): void => {
    if (!status.isLoaded) return;

    const s = status as AVPlaybackStatusSuccess;
    const durationMs = s.durationMillis ?? 0;

    if (durationMs > 0) {
      this.totalDurationMs = durationMs;
    }

    this.statusCallback?.({
      positionMillis: s.positionMillis,
      durationMillis: this.totalDurationMs,
      isPlaying: s.isPlaying,
      didJustFinish: s.didJustFinish ?? false,
    });
  };
}
