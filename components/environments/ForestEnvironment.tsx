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
import Svg, { Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// --- Firefly ---

interface FireflyConfig {
  id: number;
  startX: number;
  startY: number;
  wanderX: number;
  wanderY: number;
  size: number;
  glowSize: number;
  duration: number;
  delay: number;
}

function generateFireflies(count: number): FireflyConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 30 + Math.random() * (W - 60),
    startY: 80 + Math.random() * (H * 0.6),
    wanderX: -40 + Math.random() * 80,
    wanderY: -30 + Math.random() * 60,
    size: 3 + Math.random() * 3,
    glowSize: 14 + Math.random() * 10,
    duration: 6000 + Math.random() * 10000,
    delay: Math.random() * 8000,
  }));
}

function Firefly({ config }: { config: FireflyConfig }) {
  const progress = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    // Wander path
    progress.value = withDelay(
      config.delay,
      withRepeat(
        withTiming(1, {
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      ),
    );
    // Glow pulse (faster than movement)
    glow.value = withDelay(
      config.delay + 500,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 1000 + Math.random() * 2000 }), // pause
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateX = interpolate(
      progress.value,
      [0, 0.3, 0.7, 1],
      [0, config.wanderX * 0.6, config.wanderX, 0],
    );
    const translateY = interpolate(
      progress.value,
      [0, 0.4, 0.8, 1],
      [0, config.wanderY, config.wanderY * 0.3, 0],
    );
    const opacity = interpolate(glow.value, [0, 1], [0.1, 0.7]);
    const scale = interpolate(glow.value, [0, 1], [0.6, 1.2]);

    return {
      transform: [{ translateX }, { translateY }, { scale }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.firefly,
        {
          left: config.startX,
          top: config.startY,
          width: config.glowSize,
          height: config.glowSize,
          borderRadius: config.glowSize / 2,
        },
        style,
      ]}
    >
      <View
        style={[
          styles.fireflyCore,
          {
            width: config.size,
            height: config.size,
            borderRadius: config.size / 2,
          },
        ]}
      />
    </Animated.View>
  );
}

// --- Tree Silhouette ---

function TreeSilhouette({
  side,
  index,
}: {
  side: 'left' | 'right';
  index: number;
}) {
  const x = side === 'left' ? -20 + index * 15 : W - 50 - index * 15;
  const height = 200 + index * 60;
  const width = 60 + index * 20;

  // Simple tree shape path
  const treePath =
    side === 'left'
      ? `M ${x} ${H} L ${x} ${H - height} C ${x + width * 0.3} ${H - height - 40}, ${x + width * 0.7} ${H - height - 30}, ${x + width * 0.5} ${H - height - 60} C ${x + width * 0.3} ${H - height - 30}, ${x + width} ${H - height + 20}, ${x + width} ${H} Z`
      : `M ${x + width} ${H} L ${x + width} ${H - height} C ${x + width * 0.7} ${H - height - 40}, ${x + width * 0.3} ${H - height - 30}, ${x + width * 0.5} ${H - height - 60} C ${x + width * 0.7} ${H - height - 30}, ${x} ${H - height + 20}, ${x} ${H} Z`;

  return (
    <Svg
      width={W}
      height={H}
      style={[StyleSheet.absoluteFill, { opacity: 0.08 }]}
    >
      <Path d={treePath} fill="rgb(20,40,30)" />
    </Svg>
  );
}

// --- Main ---

export default function ForestEnvironment() {
  const fireflies = useMemo(() => generateFireflies(14), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Ground gradient */}
      <View style={styles.ground} />

      {/* Tree silhouettes */}
      <TreeSilhouette side="left" index={0} />
      <TreeSilhouette side="right" index={0} />
      <TreeSilhouette side="left" index={1} />

      {/* Fireflies */}
      {fireflies.map((f) => (
        <Firefly key={f.id} config={f} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,18,12,0.3)',
  },
  ground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(15,30,20,0.2)',
  },
  firefly: {
    position: 'absolute',
    backgroundColor: 'rgba(220,200,120,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(220,200,120,0.6)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  fireflyCore: {
    backgroundColor: 'rgba(240,220,140,0.9)',
    shadowColor: 'rgba(240,220,140,1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
});
