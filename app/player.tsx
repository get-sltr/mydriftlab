import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import EnvironmentRenderer, {
  categoryToEnvironment,
} from '../components/environments/EnvironmentRenderer';
import FilmGrain from '../components/ui/FilmGrain';
import { VisualEnvironment } from '../lib/types';
import { colors } from '../lib/colors';
import { fonts } from '../lib/typography';

const { width: W } = Dimensions.get('window');
const PROGRESS_BAR_WIDTH = W - 80;

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    category: string;
    duration: string;
    type: string;
  }>();

  const title = params.title ?? 'Untitled';
  const category = params.category ?? 'default';
  const totalDuration = parseInt(params.duration ?? '0', 10);
  const environment = categoryToEnvironment(category);

  const [isPlaying, setIsPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Auto-hide controls after 5s
  const controlsOpacity = useSharedValue(1);

  useEffect(() => {
    if (controlsVisible) {
      const timer = setTimeout(() => {
        controlsOpacity.value = withTiming(0.3, { duration: 1500 });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [controlsVisible]);

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || totalDuration === 0) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= totalDuration) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const handleTapScreen = useCallback(() => {
    controlsOpacity.value = withTiming(1, { duration: 300 });
    setControlsVisible(true);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
    controlsOpacity.value = withTiming(1, { duration: 200 });
    setControlsVisible(true);
  }, []);

  const skipBack = useCallback(() => {
    setElapsed((prev) => Math.max(0, prev - 15));
  }, []);

  const skipForward = useCallback(() => {
    setElapsed((prev) =>
      totalDuration > 0 ? Math.min(totalDuration, prev + 15) : prev + 15,
    );
  }, [totalDuration]);

  const progress =
    totalDuration > 0 ? elapsed / totalDuration : 0;

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

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
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
                    fill={colors.cream}
                    opacity={0.7}
                  />
                  <Text
                    style={styles.skipLabel}
                  >
                    15
                  </Text>
                </Svg>
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
});
