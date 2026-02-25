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
  withSequence,
  withRepeat,
  Easing,
  interpolate,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Speech from 'expo-speech';
import CosmosEnvironment from '../components/environments/CosmosEnvironment';
import FilmGrain from '../components/ui/FilmGrain';
import { colors } from '../lib/colors';
import { fonts } from '../lib/typography';

const { width: W } = Dimensions.get('window');

// 4-7-8 breathing pattern
const INHALE_DURATION = 4000;
const HOLD_DURATION = 7000;
const EXHALE_DURATION = 8000;
const CYCLE_DURATION = INHALE_DURATION + HOLD_DURATION + EXHALE_DURATION; // 19s

const TOTAL_CYCLES = 8;

const RING_MIN = 100;
const RING_MAX = 180;

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const phaseLabels: Record<BreathPhase, string> = {
  inhale: 'Breathe',
  hold: 'Hold',
  exhale: 'Release',
};

export default function BreathingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    category: string;
  }>();

  const title = params.title ?? '4-7-8 Breathing';

  const [currentCycle, setCurrentCycle] = useState(1);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [isActive, setIsActive] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Main breath progress: 0→1 over one full cycle
  // 0→0.2105 = inhale (4/19)
  // 0.2105→0.5789 = hold (7/19)
  // 0.5789→1.0 = exhale (8/19)
  const breathProgress = useSharedValue(0);

  // Ring size animation
  const ringSize = useSharedValue(RING_MIN);

  // Inner glow animation
  const innerGlow = useSharedValue(0.2);

  const voiceGuide: Record<BreathPhase, string> = {
    inhale: 'Breathe in',
    hold: 'Hold',
    exhale: 'Breathe out',
  };

  // Resolve best available voice on mount
  const [voiceId, setVoiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Prefer enhanced/premium voices for a natural, soothing tone
    const preferredVoices = [
      'com.apple.voice.premium.en-US.Zoe',
      'com.apple.voice.premium.en-US.Ava',
      'com.apple.voice.enhanced.en-US.Samantha',
      'com.apple.voice.enhanced.en-US.Ava',
      'com.apple.speech.synthesis.voice.Samantha',
    ];

    Speech.getAvailableVoicesAsync().then((voices) => {
      for (const preferred of preferredVoices) {
        const match = voices.find((v) => v.identifier === preferred);
        if (match) {
          setVoiceId(match.identifier);
          return;
        }
      }
      // Fallback: pick any enhanced en-US voice
      const enhanced = voices.find(
        (v) =>
          v.language.startsWith('en') &&
          v.quality === 'Enhanced',
      );
      if (enhanced) setVoiceId(enhanced.identifier);
    });
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled) return;
      Speech.speak(text, {
        language: 'en-US',
        voice: voiceId,
        pitch: 0.85,
        rate: 0.65,
        volume: 0.5,
      });
    },
    [voiceEnabled, voiceId],
  );

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => {
      if (prev) Speech.stop();
      return !prev;
    });
  }, []);

  const incrementCycle = useCallback(() => {
    setCurrentCycle((prev) => {
      if (prev >= TOTAL_CYCLES) {
        setIsActive(false);
        setIsComplete(true);
        return prev;
      }
      return prev + 1;
    });
  }, []);

  // Drive the breathing animation
  useEffect(() => {
    if (!isActive || isComplete) return;

    const runCycle = () => {
      // Inhale: expand ring over 4s
      setPhase('inhale');
      speak(voiceGuide.inhale);
      ringSize.value = withTiming(RING_MAX, {
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.sin),
      });
      innerGlow.value = withTiming(0.8, {
        duration: INHALE_DURATION,
        easing: Easing.inOut(Easing.sin),
      });

      // Breath progress for cosmos stars
      breathProgress.value = withSequence(
        // Inhale: 0 → 0.2105
        withTiming(4 / 19, {
          duration: INHALE_DURATION,
          easing: Easing.inOut(Easing.sin),
        }),
        // Hold: 0.2105 → 0.5789
        withTiming(11 / 19, {
          duration: HOLD_DURATION,
          easing: Easing.linear,
        }),
        // Exhale: 0.5789 → 1.0
        withTiming(1, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.sin),
        }),
      );

      // Hold: keep ring at max for 7s
      const holdTimer = setTimeout(() => {
        if (!isActive) return;
        setPhase('hold');
        speak(voiceGuide.hold);
        innerGlow.value = withTiming(0.6, {
          duration: HOLD_DURATION,
          easing: Easing.linear,
        });
      }, INHALE_DURATION);

      // Exhale: contract ring over 8s
      const exhaleTimer = setTimeout(() => {
        if (!isActive) return;
        setPhase('exhale');
        speak(voiceGuide.exhale);
        ringSize.value = withTiming(RING_MIN, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.sin),
        });
        innerGlow.value = withTiming(0.2, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.sin),
        });
      }, INHALE_DURATION + HOLD_DURATION);

      // Next cycle
      const nextTimer = setTimeout(() => {
        breathProgress.value = 0;
        incrementCycle();
      }, CYCLE_DURATION);

      return () => {
        clearTimeout(holdTimer);
        clearTimeout(exhaleTimer);
        clearTimeout(nextTimer);
      };
    };

    const cleanup = runCycle();
    return cleanup;
  }, [isActive, isComplete, currentCycle]);

  const handleBack = useCallback(() => {
    setIsActive(false);
    Speech.stop();
    router.back();
  }, [router]);

  // Controls auto-hide
  const controlsOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      controlsOpacity.value = withTiming(0.3, { duration: 1500 });
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleTapScreen = useCallback(() => {
    controlsOpacity.value = withTiming(1, { duration: 300 });
  }, []);

  // Animated styles
  const ringStyle = useAnimatedStyle(() => {
    const size = ringSize.value;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  const ringBorderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      ringSize.value,
      [RING_MIN, RING_MAX],
      [0.2, 0.5],
    );
    return {
      borderColor: `rgba(184,160,210,${opacity})`,
    };
  });

  const innerGlowStyle = useAnimatedStyle(() => {
    const size = ringSize.value * 0.6;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: innerGlow.value,
    };
  });

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  return (
    <Pressable style={styles.container} onPress={handleTapScreen}>
      {/* Cosmos background */}
      <CosmosEnvironment breathProgress={breathProgress} />
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
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={toggleVoice} style={styles.voiceButton}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                {voiceEnabled ? (
                  <>
                    <Path
                      d="M11 5L6 9H2v6h4l5 4V5z"
                      stroke={colors.cream}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"
                      stroke={colors.cream}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <>
                    <Path
                      d="M11 5L6 9H2v6h4l5 4V5z"
                      stroke={colors.creamDim}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Path
                      d="M23 9l-6 6M17 9l6 6"
                      stroke={colors.creamDim}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </Svg>
            </Pressable>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Center: Breathing ring */}
      <View style={styles.centerContainer}>
        {/* Outer ring */}
        <Animated.View style={[styles.ring, ringStyle, ringBorderStyle]}>
          {/* Inner glow */}
          <Animated.View style={[styles.innerGlow, innerGlowStyle]} />

          {/* Phase label */}
          <Text style={styles.phaseLabel}>
            {isComplete ? 'Complete' : phaseLabels[phase]}
          </Text>
        </Animated.View>

        {/* Cycle counter */}
        <Text style={styles.cycleCounter}>
          {isComplete
            ? 'Well done'
            : `Cycle ${currentCycle} of ${TOTAL_CYCLES}`}
        </Text>

        {/* Pattern label */}
        <Text style={styles.patternLabel}>4 - 7 - 8</Text>
      </View>

      {/* Bottom: done button when complete */}
      {isComplete && (
        <View style={styles.bottomContainer}>
          <SafeAreaView>
            <Pressable onPress={handleBack} style={styles.doneButton}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </SafeAreaView>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  safeArea: {},
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  voiceButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26,32,53,0.4)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  title: {
    fontFamily: fonts.headline.regular,
    fontSize: 18,
    color: colors.cream,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    borderWidth: 2,
    borderColor: 'rgba(184,160,210,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(184,160,210,0.03)',
  },
  innerGlow: {
    position: 'absolute',
    backgroundColor: colors.lavender,
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
  },
  phaseLabel: {
    fontFamily: fonts.headline.light,
    fontSize: 28,
    color: colors.cream,
    textShadowColor: 'rgba(184,160,210,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    zIndex: 1,
  },
  cycleCounter: {
    fontFamily: fonts.mono.regular,
    fontSize: 13,
    color: colors.creamMuted,
    marginTop: 32,
    letterSpacing: 0.5,
  },
  patternLabel: {
    fontFamily: fonts.mono.light,
    fontSize: 11,
    color: colors.creamDim,
    marginTop: 8,
    letterSpacing: 2,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
  },
  doneButton: {
    paddingHorizontal: 48,
    paddingVertical: 14,
    backgroundColor: 'rgba(184,160,210,0.15)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 28,
  },
  doneText: {
    fontFamily: fonts.body.medium,
    fontSize: 16,
    color: colors.cream,
  },
});
