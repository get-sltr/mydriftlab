import { useEffect, useRef, useMemo } from 'react';
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

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface ParticleConfig {
  id: number;
  x: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
  color: string;
  drift: number; // horizontal drift amount
}

interface FloatingParticlesProps {
  count?: number;
  colorScheme?: 'default' | 'lavender' | 'rose' | 'warm';
}

function generateParticles(
  count: number,
  colorScheme: string,
): ParticleConfig[] {
  const particleColors =
    colorScheme === 'lavender'
      ? [colors.lavender, colors.lavenderLight]
      : colorScheme === 'rose'
        ? [colors.dustyRose, colors.roseLight]
        : colorScheme === 'warm'
          ? [colors.dustyRose, '#D4BA6A', colors.roseLight]
          : [colors.lavender, colors.lavenderLight, colors.dustyRose, colors.roseLight];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_W,
    size: 2 + Math.random() * 4,
    opacity: 0.05 + Math.random() * 0.25,
    duration: 8000 + Math.random() * 14000, // 8-22s
    delay: Math.random() * 6000,
    color: particleColors[Math.floor(Math.random() * particleColors.length)],
    drift: -20 + Math.random() * 40, // -20 to +20px horizontal drift
  }));
}

function Particle({ config }: { config: ParticleConfig }) {
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

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [SCREEN_H + 20, -20],
    );
    const translateX = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, config.drift, 0],
    );
    const opacity = interpolate(
      progress.value,
      [0, 0.15, 0.5, 0.85, 1],
      [0, config.opacity, config.opacity, config.opacity, 0],
    );

    return {
      transform: [{ translateY }, { translateX }],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: config.x,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function FloatingParticles({
  count = 20,
  colorScheme = 'default',
}: FloatingParticlesProps) {
  const particles = useMemo(
    () => generateParticles(count, colorScheme),
    [count, colorScheme],
  );

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} config={p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
  },
});
