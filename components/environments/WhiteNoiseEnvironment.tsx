import FloatingParticles from '../ui/FloatingParticles';
import { View, StyleSheet } from 'react-native';

/**
 * White/Brown Noise environment
 * Most minimal and abstract — just floating particles (30+)
 * Lavender + rose, slow upward drift
 */
export default function WhiteNoiseEnvironment() {
  return (
    <View style={styles.container} pointerEvents="none">
      <FloatingParticles count={34} colorScheme="default" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
