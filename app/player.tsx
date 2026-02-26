import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import EnvironmentRenderer, {
  categoryToEnvironment,
} from '../components/environments/EnvironmentRenderer';
import FilmGrain from '../components/ui/FilmGrain';
import AmbientScreen from '../components/monitoring/AmbientScreen';
import { ContentPlayer } from '../services/audio/player';
import { useRecordingStore } from '../stores/recordingStore';
import { useAuthStore } from '../stores/authStore';
import { usePreferencesStore } from '../stores/preferencesStore';
import { audioAssets } from '../lib/audioAssets';
import { colors } from '../lib/colors';
import { fonts } from '../lib/typography';

type ScreenMode = 'playing' | 'monitoring';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    title: string;
    category: string;
    duration: string;
    type: string;
  }>();

  const title = params.title ?? 'Untitled';
  const category = params.category ?? 'default';
  const contentId = params.id ?? '';
  const totalDurationParam = parseInt(params.duration ?? '0', 10);
  const environment = categoryToEnvironment(category);

  // Auth + preferences for recording handoff
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);
  const sensitivity = usePreferencesStore((s) => s.sensitivity);
  const thermostatF = usePreferencesStore((s) => s.thermostatF);
  const monitoringTheme = usePreferencesStore((s) => s.monitoringTheme);
  const recordingConsent = usePreferencesStore((s) => s.recordingConsent);
  const sonarEnabled = usePreferencesStore((s) => s.sonarEnabled);
  const appleHealthEnabled = usePreferencesStore((s) => s.appleHealthEnabled);

  // Recording store
  const startSession = useRecordingStore((s) => s.startSession);
  const stopSession = useRecordingStore((s) => s.stopSession);
  const recordingStatus = useRecordingStore((s) => s.status);
  const recordingEvents = useRecordingStore((s) => s.events);
  const recordingElapsed = useRecordingStore((s) => s.elapsedSeconds);

  const playerRef = useRef<ContentPlayer | null>(null);
  const [mode, setMode] = useState<ScreenMode>('playing');
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [totalDuration, setTotalDuration] = useState(totalDurationParam);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [monitoringOverlayVisible, setMonitoringOverlayVisible] = useState(false);

  // Auto-hide controls after 5s
  const controlsOpacity = useSharedValue(1);

  useEffect(() => {
    if (controlsVisible && mode === 'playing') {
      const timer = setTimeout(() => {
        controlsOpacity.value = withTiming(0.3, { duration: 1500 });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [controlsVisible, mode]);

  // Initialize and load audio on mount
  useEffect(() => {
    const player = new ContentPlayer();
    playerRef.current = player;

    const setup = async () => {
      await player.init();

      player.onStatus((status) => {
        setElapsed(Math.floor(status.positionMillis / 1000));
        if (status.durationMillis > 0) {
          setTotalDuration(Math.floor(status.durationMillis / 1000));
        }
        setIsPlaying(status.isPlaying);

        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });

      // Register fade complete callback for recording handoff
      player.onFadeComplete(() => {
        handleFadeComplete();
      });

      // Load from bundled asset if available, otherwise no-op
      const asset = audioAssets[contentId];
      if (asset) {
        await player.load(asset);
        await player.play();
        setIsPlaying(true);
      }
    };

    setup();

    return () => {
      playerRef.current?.unload();
      playerRef.current = null;
    };
  }, [contentId]);

  // Handle Smart Fade → Recording handoff
  const handleFadeComplete = useCallback(async () => {
    // Stop and unload content player fully
    await playerRef.current?.stop();

    // Check recording consent before starting monitoring
    if (!recordingConsent) {
      // No consent — just go back to idle, don't record
      router.back();
      return;
    }

    // Transition to ambient monitoring mode
    setMode('monitoring');
    setMonitoringOverlayVisible(false);

    // Start recording session
    if (userId && accessToken) {
      await startSession(userId, accessToken, sensitivity, thermostatF, sonarEnabled, appleHealthEnabled);
    }
  }, [userId, accessToken, sensitivity, thermostatF, startSession, recordingConsent, router]);

  // Tap handlers
  const handleTapScreen = useCallback(() => {
    if (mode === 'monitoring') {
      setMonitoringOverlayVisible((v) => !v);
      return;
    }
    playerRef.current?.onUserInteraction();
    controlsOpacity.value = withTiming(1, { duration: 300 });
    setControlsVisible(true);
  }, [mode]);

  const handleBack = useCallback(async () => {
    if (mode === 'monitoring') {
      // Stop monitoring and go back
      if (accessToken) await stopSession(accessToken);
      router.back();
      return;
    }
    await playerRef.current?.stop();
    router.back();
  }, [router, mode, accessToken, stopSession]);

  const handleStopMonitoring = useCallback(async () => {
    if (accessToken) await stopSession(accessToken);
    router.replace('/(tabs)/report');
  }, [accessToken, stopSession, router]);

  const togglePlayPause = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    await player.onUserInteraction();

    if (isPlaying) {
      await player.pause();
    } else {
      await player.resume();
    }

    controlsOpacity.value = withTiming(1, { duration: 200 });
    setControlsVisible(true);
  }, [isPlaying]);

  const skipBack = useCallback(async () => {
    await playerRef.current?.onUserInteraction();
    const newPos = Math.max(0, elapsed - 15) * 1000;
    await playerRef.current?.seekTo(newPos);
  }, [elapsed]);

  const skipForward = useCallback(async () => {
    await playerRef.current?.onUserInteraction();
    const maxPos = totalDuration > 0 ? totalDuration : elapsed + 15;
    const newPos = Math.min(maxPos, elapsed + 15) * 1000;
    await playerRef.current?.seekTo(newPos);
  }, [elapsed, totalDuration]);

  const progress = totalDuration > 0 ? elapsed / totalDuration : 0;

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // ── Monitoring mode ────────────────────────────────────────────
  if (mode === 'monitoring') {
    const hrs = Math.floor(recordingElapsed / 3600);
    const mns = Math.floor((recordingElapsed % 3600) / 60);
    const scs = recordingElapsed % 60;
    const elapsedFormatted = hrs > 0
      ? `${hrs}:${String(mns).padStart(2, '0')}:${String(scs).padStart(2, '0')}`
      : `${mns}:${String(scs).padStart(2, '0')}`;

    return (
      <Pressable style={styles.container} onPress={handleTapScreen}>
        <AmbientScreen theme={monitoringTheme} />

        {/* Tap overlay — shows elapsed time + stop button */}
        {monitoringOverlayVisible && (
          <View style={styles.monitoringOverlay}>
            <SafeAreaView style={styles.monitoringContent}>
              <View style={styles.monitoringTop}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M15 18l-6-6 6-6"
                      stroke={colors.cream}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </Pressable>
              </View>

              <View style={styles.monitoringCenter}>
                <Text style={styles.monitoringElapsed}>{elapsedFormatted}</Text>
                <Text style={styles.monitoringLabel}>Monitoring</Text>
                <Text style={styles.monitoringEvents}>
                  {recordingEvents.length} event{recordingEvents.length !== 1 ? 's' : ''} detected
                </Text>
              </View>

              <View style={styles.monitoringBottom}>
                <Pressable
                  onPress={handleStopMonitoring}
                  style={styles.stopButton}
                >
                  <Text style={styles.stopButtonText}>Stop Monitoring</Text>
                </Pressable>
              </View>
            </SafeAreaView>
          </View>
        )}
      </Pressable>
    );
  }

  // ── Playback mode ──────────────────────────────────────────────
  return (
    <Pressable style={styles.container} onPress={handleTapScreen}>
      {/* Environment background */}
      <EnvironmentRenderer environment={environment} />
      <FilmGrain />

      {/* Controls overlay */}
      <Animated.View style={[styles.controlsOverlay, controlsStyle]}>
        <SafeAreaView style={styles.safeArea}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M15 18l-6-6 6-6"
                  stroke={colors.cream}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </Pressable>
          </View>

          {/* Center content */}
          <View style={styles.center}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.categoryLabel}>
              {category.replace('_', ' ')}
            </Text>
          </View>

          {/* Bottom controls */}
          <View style={styles.bottomControls}>
            {/* Progress bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        totalDuration > 0
                          ? `${progress * 100}%`
                          : '0%',
                    },
                  ]}
                />
              </View>
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>
                  {formatTime(elapsed)}
                </Text>
                <Text style={styles.timeText}>
                  {totalDuration > 0
                    ? formatTime(totalDuration)
                    : '∞'}
                </Text>
              </View>
            </View>

            {/* Playback controls */}
            <View style={styles.playbackRow}>
              {/* Skip back 15s */}
              <Pressable onPress={skipBack} style={styles.skipButton}>
                <View style={styles.skipIconWrap}>
                  <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                      fill={colors.cream}
                      opacity={0.7}
                    />
                  </Svg>
                  <Text style={styles.skipLabel}>15</Text>
                </View>
              </Pressable>

              {/* Play/Pause */}
              <Pressable
                onPress={togglePlayPause}
                style={styles.playButton}
              >
                {isPlaying ? (
                  <Svg
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <Path
                      d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"
                      fill={colors.cream}
                    />
                  </Svg>
                ) : (
                  <Svg
                    width={32}
                    height={32}
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <Path d="M8 5v14l11-7z" fill={colors.cream} />
                  </Svg>
                )}
              </Pressable>

              {/* Skip forward 15s */}
              <Pressable onPress={skipForward} style={styles.skipButton}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"
                    fill={colors.cream}
                    opacity={0.7}
                  />
                </Svg>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Pressable>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,32,53,0.4)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  center: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontFamily: fonts.headline.regular,
    fontSize: 26,
    color: colors.cream,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  categoryLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.creamMuted,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
  bottomControls: {
    paddingHorizontal: 40,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(240,235,224,0.15)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: 2,
    backgroundColor: colors.lavender,
    borderRadius: 1,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.creamDim,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  skipButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 8,
    color: colors.cream,
    position: 'absolute',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(184,160,210,0.15)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Monitoring mode
  monitoringOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,14,20,0.7)',
  },
  monitoringContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  monitoringTop: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  monitoringCenter: {
    alignItems: 'center',
  },
  monitoringElapsed: {
    fontFamily: fonts.mono.medium,
    fontSize: 48,
    color: colors.cream,
    marginBottom: 8,
  },
  monitoringLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  monitoringEvents: {
    fontFamily: fonts.mono.regular,
    fontSize: 13,
    color: colors.creamDim,
  },
  monitoringBottom: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: 'rgba(212,133,138,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(212,133,138,0.3)',
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  stopButtonText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.dustyRose,
  },
});
