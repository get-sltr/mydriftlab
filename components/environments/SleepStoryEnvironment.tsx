import FloatingParticles from '../ui/FloatingParticles';
import { View, StyleSheet } from 'react-native';

/**
 * Sleep Story environment
 * Floating particles with warm gradient, progressive screen dimming
 * 20 particles, warm tones
 */
export default function SleepStoryEnvironment() {
  return (
    <View style={styles.container} pointerEvents="none">
      <FloatingParticles count={20} colorScheme="warm" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
