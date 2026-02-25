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
  SharedValue,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';

const { width: W, height: H } = Dimensions.get('window');

// --- Star ---

interface StarConfig {
  id: number;
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  pulseDuration: number;
  delay: number;
  color: string;
}

const starColors = [
  colors.cream,
  colors.lavenderLight,
  'rgba(240,235,224,0.9)',
  'rgba(205,184,230,0.8)',
  'rgba(224,157,162,0.6)',
];

function generateStars(count: number): StarConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * W,
    y: Math.random() * H,
    size: 1 + Math.random() * 2.5,
    baseOpacity: 0.15 + Math.random() * 0.5,
    pulseDuration: 4000 + Math.random() * 12000,
    delay: Math.random() * 8000,
    color: starColors[Math.floor(Math.random() * starColors.length)],
  }));
}

function Star({
  config,
  breathProgress,
}: {
  config: StarConfig;
  breathProgress?: SharedValue<number>;
}) {
  const ownPulse = useSharedValue(0);

  useEffect(() => {
    ownPulse.value = withDelay(
      config.delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: config.pulseDuration * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: config.pulseDuration * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    // If breath progress provided, blend own pulse with breath sync
    let opacity: number;
    if (breathProgress) {
      // breathProgress: 0=start, 0.21=end inhale, 0.58=end hold, 1=end exhale
      // Stars brighten on inhale (0→0.21), hold brightness (0.21→0.58), dim on exhale (0.58→1)
      const breathFactor = interpolate(
        breathProgress.value,
        [0, 0.21, 0.58, 1],
        [0.3, 1, 0.9, 0.3],
      );
      // Blend: 60% breath sync + 40% own pulse for variety
      const blended = breathFactor * 0.6 + ownPulse.value * 0.4;
      opacity = config.baseOpacity * blended;
    } else {
      opacity = interpolate(
        ownPulse.value,
        [0, 1],
        [config.baseOpacity * 0.3, config.baseOpacity],
      );
    }
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: config.x,
          top: config.y,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          backgroundColor: config.color,
          shadowColor: config.color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: config.size * 1.5,
        },
        style,
      ]}
    />
  );
}

// --- Nebula ---

function Nebula({
  x,
  y,
  size,
  color,
  duration,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: duration * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: duration * 0.5,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const style = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 1], [0.04, 0.1]);
    const scale = interpolate(progress.value, [0, 1], [0.9, 1.1]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.nebula,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

// --- Main ---

interface CosmosEnvironmentProps {
  breathProgress?: SharedValue<number>;
}

export default function CosmosEnvironment({
  breathProgress,
}: CosmosEnvironmentProps) {
  const stars = useMemo(() => generateStars(45), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Nebula clouds */}
      <Nebula
        x={W * 0.25}
        y={H * 0.3}
        size={280}
        color={colors.lavender}
        duration={20000}
        delay={0}
      />
      <Nebula
        x={W * 0.75}
        y={H * 0.65}
        size={240}
        color={colors.dustyRose}
        duration={24000}
        delay={3000}
      />

      {/* Star field */}
      {stars.map((s) => (
        <Star key={s.id} config={s} breathProgress={breathProgress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  star: {
    position: 'absolute',
  },
  nebula: {
    position: 'absolute',
  },
});
