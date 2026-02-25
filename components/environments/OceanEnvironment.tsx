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
import Svg, { Path } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- Wave Layer ---

function WaveLayer({
  baseY,
  color,
  duration,
  amplitude,
}: {
  baseY: number;
  color: string;
  duration: number;
  amplitude: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
      -1,
      true,
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const translateX = interpolate(progress.value, [0, 1], [0, -60]);
    const translateY = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, amplitude, 0],
    );
    return { transform: [{ translateX }, { translateY }] };
  });

  // Generate a wavy SVG path
  const path = useMemo(() => {
    let d = `M 0 ${baseY}`;
    const segments = 8;
    const segW = (W + 120) / segments;
    for (let i = 0; i < segments; i++) {
      const x1 = i * segW + segW * 0.3;
      const y1 = baseY - 15 - Math.random() * 10;
      const x2 = i * segW + segW * 0.7;
      const y2 = baseY + 10 + Math.random() * 8;
      const x3 = (i + 1) * segW;
      const y3 = baseY + Math.random() * 4 - 2;
      d += ` C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`;
    }
    d += ` L ${W + 120} ${H + 50} L 0 ${H + 50} Z`;
    return d;
  }, [baseY]);

  return (
    <Animated.View style={[styles.waveContainer, style]}>
      <Svg width={W + 120} height={H} style={{ position: 'absolute' }}>
        <Path d={path} fill={color} />
      </Svg>
    </Animated.View>
  );
}

// --- Shimmer Particle ---

interface ShimmerConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

function generateShimmers(count: number, baseY: number): ShimmerConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: baseY - 30 - Math.random() * 40,
    size: 1.5 + Math.random() * 2.5,
    duration: 3000 + Math.random() * 4000,
    delay: Math.random() * 5000,
  }));
}

function ShimmerDot({ config }: { config: ShimmerConfig }) {
  const progress = useSharedValue(0);

  useEffect(() => {
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
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0.05, 0.4, 0.05],
    );
    const scale = interpolate(progress.value, [0, 0.5, 1], [0.8, 1.3, 0.8]);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
        },
        style,
      ]}
    />
  );
}

// --- Main ---

export default function OceanEnvironment() {
  const waveBaseY = H * 0.6;
  const shimmers = useMemo(
    () => generateShimmers(24, waveBaseY),
    [waveBaseY],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Moonlight glow */}
      <View style={styles.moonGlow} />

      {/* Shimmer particles on water surface */}
      {shimmers.map((s) => (
        <ShimmerDot key={s.id} config={s} />
      ))}

      {/* Wave layers at different speeds */}
      <WaveLayer
        baseY={waveBaseY + 30}
        color="rgba(40,60,100,0.35)"
        duration={12000}
        amplitude={8}
      />
      <WaveLayer
        baseY={waveBaseY}
        color="rgba(30,50,90,0.5)"
        duration={8000}
        amplitude={6}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    left: -60,
    top: 0,
    width: W + 120,
    height: H,
  },
  moonGlow: {
    position: 'absolute',
    top: 60,
    right: 40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(200,210,230,0.04)',
    shadowColor: 'rgba(200,210,230,0.2)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 60,
  },
  shimmer: {
    position: 'absolute',
    backgroundColor: 'rgba(220,230,250,0.6)',
    shadowColor: 'rgba(220,230,250,0.4)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 3,
  },
});
