import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientBorderCard from '../ui/GradientBorderCard';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

interface RoutineCardProps {
  /** Whether the user has enough history for personalization */
  hasHistory?: boolean;
}

export default function RoutineCard({ hasHistory = false }: RoutineCardProps) {
  return (
    <GradientBorderCard style={styles.outer} accessibilityLabel="Tonight's Routine">
      <View style={styles.header}>
        <View style={styles.sparkle} />
        <Text style={styles.label}>Tonight's Routine</Text>
      </View>

      {hasHistory ? (
        <>
          <Text style={styles.body}>
            Based on your best nights:{' '}
            <Text style={styles.highlight}>4-7-8 breathing</Text> (3 min) then{' '}
            <Text style={styles.highlight}>Rainfall soundscape</Text>.
          </Text>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>+18</Text>
              <Text style={styles.statLabel}>score improvement</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>5</Text>
              <Text style={styles.statLabel}>nights tested</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.body}>
          Start with a wind-down routine to help your body prepare for sleep.
          We'll learn your patterns and personalize this over time.
        </Text>
      )}
    </GradientBorderCard>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sparkle: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.lavender,
    shadowColor: colors.lavender,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  label: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.lavender,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  body: {
    fontFamily: fonts.body.light,
    fontSize: 15,
    color: colors.cream,
    lineHeight: 22,
  },
  highlight: {
    fontFamily: fonts.body.medium,
    color: colors.lavenderLight,
  },
  statRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,235,224,0.06)',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 18,
    color: colors.success,
  },
  statLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.creamDim,
    marginTop: 2,
  },
});
