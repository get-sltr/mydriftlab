/**
 * BreathingCircle — a single soft circle that slowly grows and shrinks
 * (inhale/exhale rhythm), faint lavender glow.
 */

import { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';

const { width: W, height: H } = Dimensions.get('window');
const BASE_SIZE = 100;
const MAX_SCALE = 1.6;

export default function BreathingCircle() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.08);

  useEffect(() => {
    // 4s inhale, 1s hold, 6s exhale, 1s pause = ~12s cycle
    scale.value = withRepeat(
      withSequence(
        withTiming(MAX_SCALE, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(MAX_SCALE, { duration: 1000 }),
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      false,
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 1000 }),
        withTiming(0.06, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.06, { duration: 1000 }),
      ),
      -1,
      false,
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          left: (W - BASE_SIZE) / 2,
          top: (H - BASE_SIZE) / 2,
          width: BASE_SIZE,
          height: BASE_SIZE,
          borderRadius: BASE_SIZE / 2,
        },
        circleStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
    backgroundColor: colors.lavender,
  },
});
