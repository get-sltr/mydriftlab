/**
 * Fireflies — near-black with 8-12 tiny warm dots that softly fade
 * in/out at random positions, scattered and unhurried.
 */

import { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const COUNT = 10;

interface Fly {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export default function Fireflies() {
  const flies = useMemo<Fly[]>(() => {
    return Array.from({ length: COUNT }, () => ({
      x: Math.random() * (W - 20),
      y: Math.random() * (H - 40) + 20,
      size: 3 + Math.random() * 3,
      delay: Math.random() * 6000,
      duration: 3000 + Math.random() * 5000,
    }));
  }, []);

  return (
    <>
      {flies.map((fly, i) => (
        <Fly key={i} {...fly} />
      ))}
    </>
  );
}

function Fly({ x, y, size, delay, duration }: Fly) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.15 + Math.random() * 0.05, {
            duration: duration * 0.4,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, {
            duration: duration * 0.6,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(0, { duration: 1000 + Math.random() * 3000 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    backgroundColor: '#F5E6C8',
  },
});
