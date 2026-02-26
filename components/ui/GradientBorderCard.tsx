import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../lib/colors';

interface GradientBorderCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle;
  accessibilityLabel?: string;
}

export default function GradientBorderCard({
  children,
  style,
  innerStyle,
  accessibilityLabel,
}: GradientBorderCardProps) {
  return (
    <View style={[styles.outer, style]} accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel}>
      <LinearGradient
        colors={[colors.lavender, 'transparent', colors.dustyRose]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={[styles.inner, innerStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 16,
    padding: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.4,
  },
  inner: {
    borderRadius: 15,
    backgroundColor: colors.surface,
    padding: 20,
    overflow: 'hidden',
  },
});
