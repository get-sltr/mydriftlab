/**
 * Dandelion — tiny seed-like particles drifting slowly upward
 * and swaying side to side, like dandelion seeds blown in the wind.
 * Each "seed" is a small dot with a faint wispy trail.
 */

import { useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const COUNT = 8;

interface Seed {
  startX: number;
  startY: number;
  size: number;
  drift: number;
  delay: number;
  duration: number;
}

export default function Dandelion() {
  const seeds = useMemo<Seed[]>(() => {
    return Array.from({ length: COUNT }, () => ({
      startX: W * 0.2 + Math.random() * W * 0.6,
      startY: H * 0.7 + Math.random() * H * 0.2,
      size: 2 + Math.random() * 2,
      drift: -30 + Math.random() * 60,
      delay: Math.random() * 8000,
      duration: 12000 + Math.random() * 10000,
    }));
  }, []);

  return (
    <>
      {seeds.map((seed, i) => (
        <SeedParticle key={i} {...seed} />
      ))}
    </>
  );
}

function SeedParticle({ startX, startY, size, drift, delay, duration }: Seed) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, []);

  const seedStyle = useAnimatedStyle(() => {
    const p = progress.value;

    // Drift upward from start Y toward top
    const y = interpolate(p, [0, 1], [startY, -20]);

    // Gentle sinusoidal sway
    const swayPhase = p * Math.PI * 4;
    const x = startX + drift * p + Math.sin(swayPhase) * 15;

    // Fade in at start, fade out at end
    const opacity = interpolate(
      p,
      [0, 0.08, 0.5, 0.9, 1],
      [0, 0.12, 0.15, 0.08, 0],
    );

    return {
      transform: [{ translateX: x }, { translateY: y }],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.seed, seedStyle]}>
      {/* Tiny stem line */}
      <View
        style={[
          styles.stem,
          {
            height: size * 3,
            left: size / 2 - 0.5,
            top: -size * 2,
          },
        ]}
      />
      {/* Seed dot */}
      <View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  seed: {
    position: 'absolute',
  },
  dot: {
    backgroundColor: '#F0EBE0',
  },
  stem: {
    position: 'absolute',
    width: 1,
    backgroundColor: 'rgba(240,235,224,0.08)',
  },
});
