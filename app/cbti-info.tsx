import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlassButton from '../components/ui/GlassButton';
import { CBTI_WEEKS } from '../services/cbti/programEngine';
import { colors } from '../lib/colors';
import { fonts, textStyles } from '../lib/typography';

export default function CbtiInfoScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>About Insomnia Fighter</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>What is CBT-I?</Text>
          <Text style={styles.body}>
            Cognitive Behavioral Therapy for Insomnia (CBT-I) is the gold-standard,
            first-line treatment for chronic insomnia recommended by the American
            Academy of Sleep Medicine, the American College of Physicians, and the
            European Sleep Research Society.
          </Text>
          <Text style={styles.body}>
            Unlike sleeping pills, CBT-I addresses the root causes of insomnia —
            behavioral patterns and thought processes — resulting in lasting improvement
            without medication dependency.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Evidence Base</Text>
          <Text style={styles.body}>
            CBT-I has been studied in over 200 clinical trials. Research consistently
            shows it is more effective than medication for long-term insomnia treatment,
            with effects that last years after completion.
          </Text>
          <Text style={styles.body}>
            70-80% of patients experience significant improvement. Average sleep onset
            time decreases from 45+ minutes to under 15 minutes.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6-Week Program Overview</Text>
          {CBTI_WEEKS.map((week) => (
            <View key={week.week} style={styles.weekRow}>
              <View style={styles.weekNumber}>
                <Text style={styles.weekNumberText}>{week.week}</Text>
              </View>
              <View style={styles.weekInfo}>
                <Text style={styles.weekFocus}>{week.focus}</Text>
                <Text style={styles.weekAction}>{week.keyAction}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sleep Restriction Safety</Text>
          <Text style={styles.body}>
            During the first 1-2 weeks, you may feel more tired than usual during
            the day. This is normal and temporary — it's a sign that sleep pressure
            is building, which is how the therapy works.
          </Text>
          <Text style={styles.body}>
            We never reduce your time-in-bed below 5.5 hours. The temporary daytime
            sleepiness resolves as your sleep efficiency improves.
          </Text>
          <Text style={styles.warningText}>
            If you drive for work, operate heavy machinery, or have a condition
            that could be worsened by sleep restriction, consult your doctor before
            starting this program.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>When to Seek Professional Help</Text>
          <Text style={styles.body}>
            This self-guided program is educational. For severe insomnia or when
            accompanied by other conditions, professional guidance is recommended:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bullet}>Insomnia lasting more than 3 months despite this program</Text>
            <Text style={styles.bullet}>Severe depression or anxiety alongside insomnia</Text>
            <Text style={styles.bullet}>Suspected sleep apnea (loud snoring, gasping, high BDI)</Text>
            <Text style={styles.bullet}>Other sleep disorders (restless legs, narcolepsy)</Text>
            <Text style={styles.bullet}>Chronic pain as the primary sleep disruptor</Text>
          </View>
        </View>

        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.disclaimerBody}>
            This program is educational and informational. It is not a substitute
            for professional medical advice, diagnosis, or treatment. For severe
            or persistent insomnia, consult a healthcare provider or sleep specialist.
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
    marginBottom: 10,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(184,160,210,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  weekNumberText: {
    fontFamily: fonts.mono.medium,
    fontSize: 14,
    color: colors.lavender,
  },
  weekInfo: {
    flex: 1,
  },
  weekFocus: {
    fontFamily: fonts.body.semiBold,
    fontSize: 15,
    color: colors.cream,
    marginBottom: 4,
  },
  weekAction: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.creamMuted,
    lineHeight: 18,
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
  warningText: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.dustyRose,
    lineHeight: 22,
    marginTop: 8,
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
  },
  backButton: {
    marginBottom: 8,
  },
});
