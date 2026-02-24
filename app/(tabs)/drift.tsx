import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function DriftScreen() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>Time to wind down</Text>

        {/* Personalized routine card placeholder */}
        <View style={styles.routineCard}>
          <Text style={styles.routineLabel}>Tonight's Routine</Text>
          <Text style={styles.routineText}>
            Based on your best nights: 4-7-8 breathing followed by Rainfall
            soundscape.
          </Text>
        </View>

        {/* Content sections placeholder */}
        <Text style={styles.sectionTitle}>Sleep Stories</Text>
        <View style={styles.placeholderRow}>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Midnight Train to Kyoto</Text>
            <Text style={styles.cardDuration}>25 min</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>The Lighthouse Keeper</Text>
            <Text style={styles.cardDuration}>20 min</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Soundscapes</Text>
        <View style={styles.placeholderRow}>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Gentle Rain</Text>
            <Text style={styles.cardDuration}>∞</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Pacific Shore</Text>
            <Text style={styles.cardDuration}>∞</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Meditations</Text>
        <View style={styles.placeholderRow}>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>4-7-8 Breathing</Text>
            <Text style={styles.cardDuration}>5 min</Text>
          </View>
          <View style={styles.contentCard}>
            <Text style={styles.cardTitle}>Body Scan</Text>
            <Text style={styles.cardDuration}>10 min</Text>
          </View>
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
  greeting: {
    ...textStyles.h1,
    color: colors.cream,
    textShadow: '0 0 20px rgba(184,160,210,0.15)',
  },
  subtitle: {
    ...textStyles.body,
    color: colors.creamMuted,
    marginTop: 4,
    marginBottom: 24,
  },
  routineCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 32,
  },
  routineLabel: {
    ...textStyles.label,
    color: colors.lavender,
    marginBottom: 8,
  },
  routineText: {
    ...textStyles.body,
    color: colors.cream,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.cream,
    marginBottom: 12,
  },
  placeholderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  contentCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  cardTitle: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.cream,
    marginBottom: 4,
  },
  cardDuration: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamMuted,
  },
});
