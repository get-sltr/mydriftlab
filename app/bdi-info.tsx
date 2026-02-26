import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlassButton from '../components/ui/GlassButton';
import { colors } from '../lib/colors';
import { fonts, textStyles } from '../lib/typography';

export default function BdiInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Breathing Disturbance Index</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What BDI Measures</Text>
          <Text style={styles.body}>
            The Breathing Disturbance Index (BDI) counts breathing irregularities
            per hour of recorded sleep. It detects pauses, rate changes, and
            periods of irregular breathing using your phone's microphone.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>How It's Calculated</Text>
          <Text style={styles.body}>
            MyDriftLAB analyzes your breathing in 60-second windows throughout
            the night. The following are counted as disturbances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>Gaps longer than 10 seconds between breaths</Text>
            <Text style={styles.bullet}>Breathing regularity below 20% for more than 15 seconds</Text>
            <Text style={styles.bullet}>Breathing rate changes greater than 6 BPM within 60 seconds</Text>
          </View>
          <Text style={styles.body}>
            BDI = total disturbances / hours of recording
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Severity Scale</Text>
          <View style={styles.scaleRow}>
            <View style={[styles.scaleBar, { backgroundColor: colors.success }]} />
            <Text style={styles.scaleLabel}>0–5: Normal</Text>
          </View>
          <View style={styles.scaleRow}>
            <View style={[styles.scaleBar, { backgroundColor: colors.temperature }]} />
            <Text style={styles.scaleLabel}>5–15: Mild</Text>
          </View>
          <View style={styles.scaleRow}>
            <View style={[styles.scaleBar, { backgroundColor: colors.dustyRose }]} />
            <Text style={styles.scaleLabel}>15–30: Moderate</Text>
          </View>
          <View style={styles.scaleRow}>
            <View style={[styles.scaleBar, { backgroundColor: colors.noise }]} />
            <Text style={styles.scaleLabel}>30+: Severe</Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          <Text style={styles.disclaimerBody}>
            BDI is an estimate derived from audio analysis using your phone's
            microphone. It is not a substitute for polysomnography (a clinical
            sleep study) or a medical diagnosis.
          </Text>
          <Text style={styles.disclaimerBody}>
            If your BDI consistently scores above 15 (moderate or severe),
            please consult a sleep specialist. Undiagnosed sleep apnea is a
            serious health condition that requires professional evaluation.
          </Text>
        </View>

        <GlassButton
          title="Got it"
          onPress={() => router.back()}
          size="large"
          style={styles.backButton}
        />

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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
    marginBottom: 12,
  },
  body: {
    ...textStyles.body,
    color: colors.creamMuted,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletList: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  bullet: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamMuted,
    lineHeight: 22,
    paddingLeft: 12,
    marginBottom: 4,
  },
  scaleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  scaleBar: {
    width: 24,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  scaleLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 14,
    color: colors.cream,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(212,133,138,0.08)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(212,133,138,0.2)',
    marginBottom: 24,
  },
  disclaimerTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 16,
    color: colors.dustyRose,
    marginBottom: 12,
  },
  disclaimerBody: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamMuted,
    lineHeight: 22,
    marginBottom: 10,
  },
  backButton: {
    marginBottom: 8,
  },
});
