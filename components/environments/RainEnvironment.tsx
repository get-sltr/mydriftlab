import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';

const { width: W, height: H } = Dimensions.get('window');

// --- Raindrop ---

interface DropConfig {
  id: number;
  x: number;
  width: number;
  height: number;
  opacity: number;
  duration: number;
  delay: number;
}

function generateDrops(count: number): DropConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    width: 1 + Math.random() * 1.5,
    height: 12 + Math.random() * 24,
    opacity: 0.1 + Math.random() * 0.35,
    duration: 1200 + Math.random() * 1800, // 1.2-3s fall
    delay: Math.random() * 3000,
  }));
}

function Raindrop({ config }: { config: DropConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, {
          duration: config.duration,
          easing: Easing.linear,
        }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-40, H + 40]);
    const opacity = interpolate(
      progress.value,
      [0, 0.05, 0.85, 1],
      [0, config.opacity, config.opacity, 0],
    );
    return { transform: [{ translateY }], opacity };
  });

  return (
    <Animated.View
      style={[
        styles.drop,
        {
          left: config.x,
          width: config.width,
          height: config.height,
          borderRadius: config.width / 2,
        },
        style,
      ]}
    />
  );
}

// --- Ripple ---

interface RippleConfig {
  id: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  maxSize: number;
}

function generateRipples(count: number): RippleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: H - 40 - Math.random() * 60,
    duration: 2000 + Math.random() * 2000,
    delay: Math.random() * 4000,
    maxSize: 20 + Math.random() * 30,
  }));
}

function Ripple({ config }: { config: RippleConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, {
          duration: config.duration,
          easing: Easing.out(Easing.quad),
        }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const size = interpolate(progress.value, [0, 1], [2, config.maxSize]);
    const opacity = interpolate(progress.value, [0, 0.2, 1], [0.3, 0.2, 0]);
    return {
      width: size,
      height: size * 0.4,
      borderRadius: size / 2,
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.ripple,
        { left: config.x, top: config.y },
        style,
      ]}
    />
  );
}

// --- Cloud Mist ---

function CloudMist({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const startX = index === 0 ? -200 : W;
  const endX = index === 0 ? W + 100 : -300;
  const y = 40 + index * 80;

  useEffect(() => {
    progress.value = withDelay(
      index * 4000,
      withRepeat(
        withTiming(1, {
          duration: 25000 + index * 8000,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [startX, endX]);
    const opacity = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0, 0.04, 0.04, 0],
    );
    return { transform: [{ translateX }], opacity };
  });

  return (
    <Animated.View
      style={[
        styles.cloud,
        { top: y },
        style,
      ]}
    />
  );
}

// --- Main ---

export default function RainEnvironment() {
  const drops = useMemo(() => generateDrops(65), []);
  const ripples = useMemo(() => generateRipples(12), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Cloud mist layers */}
      <CloudMist index={0} />
      <CloudMist index={1} />

      {/* Raindrops */}
      {drops.map((d) => (
        <Raindrop key={d.id} config={d} />
      ))}

      {/* Ripples at bottom */}
      {ripples.map((r) => (
        <Ripple key={r.id} config={r} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  drop: {
    position: 'absolute',
    backgroundColor: 'rgba(160,185,220,0.5)',
  },
  ripple: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(160,185,220,0.25)',
    backgroundColor: 'transparent',
  },
  cloud: {
    position: 'absolute',
    width: 300,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(160,185,220,0.08)',
  },
});
