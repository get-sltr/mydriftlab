import { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width: W, height: H } = Dimensions.get('window');

// --- Window Light ---

interface WindowConfig {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  flickerDuration: number;
  delay: number;
  minOpacity: number;
  maxOpacity: number;
}

const windowColors = [
  'rgba(255,220,150,0.6)',
  'rgba(200,210,240,0.5)',
  'rgba(255,200,100,0.5)',
  'rgba(180,200,255,0.4)',
  'rgba(255,240,200,0.45)',
];

function generateWindows(count: number): WindowConfig[] {
  // Cluster windows into "buildings" along the horizon
  const buildings = 6;
  const buildingWidth = W / buildings;

  return Array.from({ length: count }, (_, i) => {
    const buildingIndex = Math.floor(Math.random() * buildings);
    const buildingX = buildingIndex * buildingWidth;
    const buildingTop = H * 0.45 + Math.random() * (H * 0.15);

    return {
      id: i,
      x: buildingX + 8 + Math.random() * (buildingWidth - 20),
      y: buildingTop + Math.random() * (H * 0.25),
      width: 4 + Math.random() * 6,
      height: 4 + Math.random() * 5,
      color: windowColors[Math.floor(Math.random() * windowColors.length)],
      flickerDuration: 4000 + Math.random() * 12000,
      delay: Math.random() * 6000,
      minOpacity: 0.15 + Math.random() * 0.15,
      maxOpacity: 0.5 + Math.random() * 0.4,
    };
  });
}

function WindowLight({ config }: { config: WindowConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: config.flickerDuration * 0.4,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.3, {
            duration: config.flickerDuration * 0.2,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0.8, {
            duration: config.flickerDuration * 0.4,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        true,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [config.minOpacity, config.maxOpacity],
    );
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.window,
        {
          left: config.x,
          top: config.y,
          width: config.width,
          height: config.height,
          backgroundColor: config.color,
        },
        style,
      ]}
    />
  );
}

// --- Headlight Streak ---

function HeadlightStreak({ index }: { index: number }) {
  const progress = useSharedValue(0);
  const y = H * 0.78 + index * 12;
  const duration = 8000 + index * 4000;
  const goingRight = index % 2 === 0;

  useEffect(() => {
    progress.value = withDelay(
      index * 3000,
      withRepeat(
        withTiming(1, { duration, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateX = goingRight
      ? interpolate(progress.value, [0, 1], [-100, W + 100])
      : interpolate(progress.value, [0, 1], [W + 100, -100]);
    const opacity = interpolate(
      progress.value,
      [0, 0.1, 0.5, 0.9, 1],
      [0, 0.15, 0.2, 0.15, 0],
    );
    return { transform: [{ translateX }], opacity };
  });

  const color = goingRight
    ? 'rgba(255,240,200,0.3)'
    : 'rgba(255,100,80,0.2)';

  return (
    <Animated.View
      style={[
        styles.headlight,
        { top: y, backgroundColor: color },
        style,
      ]}
    />
  );
}

// --- Main ---

export default function CityNightEnvironment() {
  const windows = useMemo(() => generateWindows(24), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Horizon glow gradient */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(80,60,40,0.06)',
          'rgba(100,70,40,0.1)',
          'rgba(40,30,20,0.15)',
        ]}
        locations={[0, 0.4, 0.6, 1]}
        style={styles.horizonGlow}
      />

      {/* Window lights */}
      {windows.map((w) => (
        <WindowLight key={w.id} config={w} />
      ))}

      {/* Headlight streaks */}
      <HeadlightStreak index={0} />
      <HeadlightStreak index={1} />
      <HeadlightStreak index={2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  horizonGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: H * 0.35,
    height: H * 0.65,
  },
  window: {
    position: 'absolute',
    borderRadius: 1,
    shadowColor: 'rgba(255,220,150,0.3)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
  headlight: {
    position: 'absolute',
    width: 60,
    height: 2,
    borderRadius: 1,
  },
});
