/**
 * AmbientScreen — wrapper that renders the user's selected monitoring theme.
 * Near-black background with minimal, soothing animations.
 * Tap to reveal the controls overlay (handled by parent).
 */

import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '../../lib/colors';
import type { MonitoringTheme } from '../../stores/preferencesStore';
import FloatingParticles from '../ui/FloatingParticles';
import Fireflies from './Fireflies';
import BreathingCircle from './BreathingCircle';
import NebulaPulse from './NebulaPulse';
import Constellation from './Constellation';
import Dandelion from './Dandelion';

interface Props {
  theme: MonitoringTheme;
}

export default function AmbientScreen({ theme }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Theme-specific content */}
      {theme === 'fireflies' && <Fireflies />}
      {theme === 'breathing' && <BreathingCircle />}
      {theme === 'particles' && (
        <FloatingParticles count={8} colorScheme="default" />
      )}
      {theme === 'nebula' && <NebulaPulse />}
      {theme === 'constellation' && <Constellation />}
      {theme === 'dandelion' && <Dandelion />}

      {/* Monitoring indicator dot — pulsing red at bottom center */}
      <MonitoringDot />
    </View>
  );
}

function MonitoringDot() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.dot, dotStyle]} />;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.deep,
  },
  dot: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4585A',
  },
});
