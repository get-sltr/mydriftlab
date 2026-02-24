import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function TrendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>14-Day Overview</Text>

        {/* Average score placeholder */}
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Average Rest Score</Text>
          <Text style={styles.avgValue}>--</Text>
          <Text style={styles.avgTrend}>Start recording to see trends</Text>
        </View>

        {/* Bar chart placeholder */}
        <View style={styles.chartArea}>
          <View style={styles.chartPlaceholder}>
            {Array.from({ length: 14 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  { height: 8, backgroundColor: colors.creamDim },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Message */}
        <View style={styles.messageCard}>
          <Text style={styles.messageText}>
            More insights unlock after 7 nights of monitoring.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    ...textStyles.h1,
    color: colors.cream,
    marginBottom: 24,
  },
  avgCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avgLabel: {
    ...textStyles.label,
    color: colors.creamMuted,
    marginBottom: 8,
  },
  avgValue: {
    fontFamily: fonts.headline.light,
    fontSize: 56,
    color: colors.creamDim,
  },
  avgTrend: {
    ...textStyles.caption,
    color: colors.creamDim,
    marginTop: 4,
  },
  chartArea: {
    marginBottom: 24,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 4,
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  messageCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  messageText: {
    ...textStyles.caption,
    color: colors.creamMuted,
    textAlign: 'center',
  },
});
