import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Morning Report</Text>

        {/* Rest Score placeholder */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreRing}>
            <Text style={styles.scoreText}>--</Text>
          </View>
          <Text style={styles.scoreLabel}>No data yet</Text>
        </View>

        {/* Night summary placeholder */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Start your first night of monitoring to see your morning report here.
            DriftLab will analyze your sleep environment and give you a detailed
            breakdown of what happened overnight.
          </Text>
        </View>

        {/* Insight card placeholder */}
        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>DriftLab Insight</Text>
          <Text style={styles.insightText}>
            Your personalized sleep insights will appear here after your first
            recorded night.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    ...textStyles.h1,
    color: colors.cream,
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.creamDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  scoreText: {
    fontFamily: fonts.headline.light,
    fontSize: 48,
    color: colors.creamDim,
  },
  scoreLabel: {
    ...textStyles.caption,
    color: colors.creamMuted,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  summaryText: {
    ...textStyles.body,
    color: colors.creamMuted,
  },
  insightCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  insightLabel: {
    ...textStyles.label,
    color: colors.lavender,
    marginBottom: 8,
  },
  insightText: {
    ...textStyles.body,
    color: colors.creamMuted,
  },
});
