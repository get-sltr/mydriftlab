import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

interface GlowTextProps {
  children: string;
  style?: TextStyle;
  variant?: 'h1' | 'h2' | 'h3';
}

export default function GlowText({
  children,
  style,
  variant = 'h1',
}: GlowTextProps) {
  return (
    <Text style={[styles.base, styles[variant], style]} accessibilityRole="header">{children}</Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.cream,
    textShadowColor: 'rgba(184,160,210,0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  h1: {
    fontFamily: fonts.headline.light,
    fontSize: 32,
    lineHeight: 40,
  },
  h2: {
    fontFamily: fonts.headline.regular,
    fontSize: 24,
    lineHeight: 32,
  },
  h3: {
    fontFamily: fonts.headline.medium,
    fontSize: 20,
    lineHeight: 28,
  },
});
