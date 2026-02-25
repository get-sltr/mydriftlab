/**
 * Recording Screen — Night Monitoring
 * Full-screen composition with breathing orb, live dB, event toasts,
 * progressive dimming, and background audio recording.
 */

import { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Brightness from 'expo-brightness';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';
import FloatingParticles from '../../components/ui/FloatingParticles';
import FilmGrain from '../../components/ui/FilmGrain';
import GlassButton from '../../components/ui/GlassButton';
import BreathingOrb from '../../components/recording/BreathingOrb';
import EventToast from '../../components/recording/EventToast';
import { useRecordingStore } from '../../stores/recordingStore';
import { useAuthStore } from '../../stores/authStore';

// Progressive dimming stages (minutes → brightness)
const DIMMING_STAGES = [
  { minutes: 5, brightness: 0.3 },
  { minutes: 15, brightness: 0.15 },
  { minutes: 30, brightness: 0.05 },
];

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RecordScreen() {
  useKeepAwake();

  const {
    status,
    currentDb,
    baselineDb,
    events,
    recentToastEvent,
    elapsedSeconds,
    temperatureF,
    startSession,
    stopSession,
    recordUserInteraction,
    dismissToast,
  } = useRecordingStore();

  const { userId, accessToken } = useAuthStore();

  const isRecording = status === 'recording';
  const isLoading = status === 'starting' || status === 'stopping';
  const originalBrightnessRef = useRef<number | null>(null);
  const lastDimStageRef = useRef(-1);

  // Recording indicator pulse animation
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      pulse.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    } else {
      pulse.value = withTiming(0, { duration: 300 });
    }
  }, [isRecording]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [1, 0.3]),
  }));

  // Progressive dimming
  useEffect(() => {
    if (!isRecording) return;

    const elapsedMinutes = elapsedSeconds / 60;
    let targetStage = -1;

    for (let i = DIMMING_STAGES.length - 1; i >= 0; i--) {
      if (elapsedMinutes >= DIMMING_STAGES[i].minutes) {
        targetStage = i;
        break;
      }
    }

    if (targetStage !== lastDimStageRef.current && targetStage >= 0) {
      lastDimStageRef.current = targetStage;
      Brightness.setBrightnessAsync(DIMMING_STAGES[targetStage].brightness).catch(() => {});
    }
  }, [elapsedSeconds, isRecording]);

  // Save/restore brightness
  useEffect(() => {
    if (isRecording && originalBrightnessRef.current === null) {
      Brightness.getBrightnessAsync()
        .then((b) => { originalBrightnessRef.current = b; })
        .catch(() => {});
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Restore brightness
      if (originalBrightnessRef.current !== null) {
        Brightness.setBrightnessAsync(originalBrightnessRef.current).catch(() => {});
        originalBrightnessRef.current = null;
      }
      lastDimStageRef.current = -1;

      // Stop session if still recording
      const { status: currentStatus } = useRecordingStore.getState();
      const { accessToken: token } = useAuthStore.getState();
      if (currentStatus === 'recording' && token) {
        useRecordingStore.getState().stopSession(token);
      }
    };
  }, []);

  const handleToggle = useCallback(async () => {
    if (!userId || !accessToken) return;

    if (isRecording) {
      // Restore brightness before stopping
      if (originalBrightnessRef.current !== null) {
        await Brightness.setBrightnessAsync(originalBrightnessRef.current).catch(() => {});
        originalBrightnessRef.current = null;
        lastDimStageRef.current = -1;
      }
      await stopSession(accessToken);
    } else {
      recordUserInteraction();
      await startSession(userId, accessToken, 'medium');
    }
  }, [userId, accessToken, isRecording, startSession, stopSession, recordUserInteraction]);

  const handleScreenPress = useCallback(() => {
    if (isRecording) {
      recordUserInteraction();
      // Temporarily restore brightness on interaction
      if (originalBrightnessRef.current !== null) {
        Brightness.setBrightnessAsync(originalBrightnessRef.current).catch(() => {});
        lastDimStageRef.current = -1;
      }
    }
  }, [isRecording, recordUserInteraction]);

  // Ambient message
  const isElevated = currentDb > baselineDb + 10;
  const ambientMessage = !isRecording
    ? 'Tap to begin monitoring'
    : isElevated
      ? 'Elevated noise detected'
      : 'Everything is quiet';

  return (
    <Pressable style={styles.flex} onPress={handleScreenPress}>
      <SafeAreaView style={styles.container}>
        {/* Background layers */}
        <FloatingParticles count={18} />
        <FilmGrain />

        <View style={styles.content}>
          {/* Breathing orb */}
          <BreathingOrb currentDb={currentDb} isRecording={isRecording} />

          {/* Ambient message */}
          <Text style={styles.ambientMessage}>{ambientMessage}</Text>

          {/* Start/Stop button */}
          <GlassButton
            title={isRecording ? 'Stop Monitoring' : 'Start Monitoring'}
            onPress={handleToggle}
            variant={isRecording ? 'secondary' : 'primary'}
            size="large"
            loading={isLoading}
            disabled={isLoading || !userId}
            style={styles.actionButton}
          />

          {/* Bottom stats */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {isRecording ? formatElapsed(elapsedSeconds) : '0:00'}
              </Text>
              <Text style={styles.statLabel}>Elapsed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {temperatureF != null ? `${temperatureF}\u00B0F` : '--'}
              </Text>
              <Text style={styles.statLabel}>Temp</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{events.length}</Text>
              <Text style={styles.statLabel}>Events</Text>
            </View>
          </View>

          {/* Recording indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <Animated.View style={[styles.recordingDot, pulseStyle]} />
              <Text style={styles.recordingText}>Monitoring</Text>
            </View>
          )}
        </View>

        {/* Event toast overlay */}
        <EventToast event={recentToastEvent} onDismiss={dismissToast} />
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientMessage: {
    fontFamily: fonts.body.light,
    fontSize: 14,
    color: colors.creamMuted,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    width: 220,
    marginBottom: 60,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 40,
    position: 'absolute',
    bottom: 100,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.mono.regular,
    fontSize: 16,
    color: colors.cream,
  },
  statLabel: {
    fontFamily: fonts.mono.light,
    fontSize: 10,
    color: colors.creamDim,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    bottom: 60,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dustyRose,
  },
  recordingText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamMuted,
    letterSpacing: 0.5,
  },
});
