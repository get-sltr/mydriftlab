/**
 * BreathingOrb — animated ambient dB display
 * 200px diameter orb with radial gradient, 6s breathing cycle,
 * and pulsing shadow glow. Displays live dB reading.
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

const ORB_SIZE = 200;
const BREATHING_DURATION = 6000; // 6s full cycle

interface BreathingOrbProps {
  currentDb: number;
  isRecording: boolean;
}

export default function BreathingOrb({ currentDb, isRecording }: BreathingOrbProps) {
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      breathe.value = withRepeat(
        withTiming(1, {
          duration: BREATHING_DURATION,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      );
    } else {
      breathe.value = withTiming(0, { duration: 600 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(breathe.value, [0, 1], [1.0, 1.08]);
    const shadowOpacity = interpolate(breathe.value, [0, 1], [0.15, 0.35]);

    return {
      transform: [{ scale }],
      shadowOpacity,
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* SVG radial gradient background */}
      <Svg
        width={ORB_SIZE}
        height={ORB_SIZE}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <RadialGradient id="orbGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors.lavender} stopOpacity="0.2" />
            <Stop offset="60%" stopColor={colors.lavender} stopOpacity="0.06" />
            <Stop offset="100%" stopColor={colors.lavender} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle
          cx={ORB_SIZE / 2}
          cy={ORB_SIZE / 2}
          r={ORB_SIZE / 2}
          fill="url(#orbGradient)"
        />
      </Svg>

      {/* Glass border ring */}
      <View style={styles.ring} />

      {/* dB text */}
      <Text style={styles.dbText}>{currentDb}</Text>
      <Text style={styles.dbLabel}>dB</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ORB_SIZE,
    height: ORB_SIZE,
    borderRadius: ORB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 30,
    elevation: 8,
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: ORB_SIZE / 2,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
  },
  dbText: {
    fontFamily: fonts.headline.light,
    fontSize: 42,
    color: colors.cream,
  },
  dbLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamMuted,
    marginTop: -4,
  },
});
