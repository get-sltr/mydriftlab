/**
 * NebulaPulse — subtle radial gradient that slowly shifts between
 * deep navy and dark purple, barely perceptible movement.
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
  interpolateColor,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const SIZE = Math.max(W, H) * 0.7;

export default function NebulaPulse() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const nebulaStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['rgba(18,24,39,0.6)', 'rgba(40,25,55,0.5)', 'rgba(18,24,39,0.6)'],
    ),
    transform: [{ scale: 0.9 + progress.value * 0.2 }],
    opacity: 0.15 + progress.value * 0.05,
  }));

  return (
    <Animated.View
      style={[
        styles.nebula,
        {
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          left: (W - SIZE) / 2,
          top: (H - SIZE) / 2,
        },
        nebulaStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  nebula: {
    position: 'absolute',
  },
});
