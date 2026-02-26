import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import { useAuthStore } from '../../stores/authStore';
import { useCBTIStore } from '../../stores/cbtiStore';
import { useExperimentStore, type ExperimentWithLogs } from '../../stores/experimentStore';
import { useRecordingStore } from '../../stores/recordingStore';
import { matchRemedies } from '../../services/analysis/remedyMatcher';
import { CBTI_WEEKS } from '../../services/cbti/programEngine';
import { getLessonsForWeek } from '../../data/cbtiContent';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';
import type { RemedySuggestion } from '../../lib/types';

export default function LabsScreen() {
  const router = useRouter();
  const userId = useAuthStore((s) => s.userId);
  const accessToken = useAuthStore((s) => s.accessToken);

  const cbtiProgram = useCBTIStore((s) => s.program);
  const startCBTI = useCBTIStore((s) => s.startProgram);
  const cbtiProgress = useCBTIStore((s) => s.getWeeklyProgress);
  const cbtiPrescription = useCBTIStore((s) => s.getPrescription);
  const checkWeekAdvancement = useCBTIStore((s) => s.checkWeekAdvancement);

  const activeExperiment = useExperimentStore((s) => s.activeExperiment);
  const pastExperiments = useExperimentStore((s) => s.pastExperiments);
  const abandonExperiment = useExperimentStore((s) => s.abandonExperiment);

  const breathTrend = useRecordingStore((s) => s.breathTrend);
  const sleepEfficiency = useRecordingStore((s) => s.sleepEfficiency);

  const [suggestions, setSuggestions] = useState<RemedySuggestion[]>([]);

  useFocusEffect(
    useCallback(() => {
      // Check for CBT-I week advancement
      checkWeekAdvancement();

      // Generate remedy suggestions from latest data
      const triedIds = new Set(pastExperiments.map((e) => e.remedyId));
      if (activeExperiment) triedIds.add(activeExperiment.remedyId);

      const metrics = {
        bdi: breathTrend?.bdi ?? 0,
        sleepEfficiency: sleepEfficiency?.sleepEfficiency ?? 85,
        snoring_nights_per_week: 0,
        noise_events: 0,
        light_events: 0,
        temperature_events: 0,
        breathingRegularity: breathTrend?.avgRegularity ?? 0.5,
      };

      setSuggestions(matchRemedies(metrics, triedIds));
    }, [breathTrend, sleepEfficiency, pastExperiments, activeExperiment]),
  );

  const handleStartCBTI = () => {
    if (!userId) return;
    Alert.alert(
      'Start Insomnia Fighter',
      'This is a 6-week structured program based on CBT-I, the clinical gold standard for insomnia treatment. Week 1 establishes your baseline. Ready to begin?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Program',
          onPress: () => startCBTI(userId),
        },
      ],
    );
  };

  const handleAbandonExperiment = () => {
    Alert.alert(
      'Abandon Experiment',
      'Are you sure? Your progress will be saved but the experiment will be marked as abandoned.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Abandon', style: 'destructive', onPress: abandonExperiment },
      ],
    );
  };

  const progress = cbtiProgram ? cbtiProgress() : null;
  const prescription = cbtiProgram ? cbtiPrescription() : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlowText style={styles.title}>Sleep Lab</GlowText>

        {/* Section 1: Insomnia Fighter (CBT-I) */}
        {!cbtiProgram || cbtiProgram.status === 'abandoned' || cbtiProgram.status === 'completed' ? (
          <View style={styles.cbtiPromoCard}>
            <Text style={styles.cbtiPromoTitle}>Insomnia Fighter</Text>
            <Text style={styles.cbtiPromoSubtitle}>6-Week CBT-I Program</Text>
            <Text style={styles.cbtiPromoBody}>
              Cognitive Behavioral Therapy for Insomnia is the clinical gold standard.
              This structured program uses sleep restriction, stimulus control, and
              cognitive restructuring to rebuild healthy sleep patterns.
            </Text>
            <GlassButton
              title="Start 6-Week Program"
              onPress={handleStartCBTI}
              size="large"
              style={styles.ctaButton}
            />
            <Pressable onPress={() => router.push('/cbti-info')}>
              <Text style={styles.learnMoreText}>Learn more about CBT-I</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.cbtiActiveCard}>
            <View style={styles.cbtiHeader}>
              <Text style={styles.cbtiActiveTitle}>Insomnia Fighter</Text>
              <View style={styles.weekBadge}>
                <Text style={styles.weekBadgeText}>
                  Week {cbtiProgram.currentWeek}
                </Text>
              </View>
            </View>

            <Text style={styles.cbtiWeekFocus}>
              {CBTI_WEEKS[cbtiProgram.currentWeek - 1]?.focus}
            </Text>

            {/* Week progression dots */}
            <View style={styles.weekDots}>
              {CBTI_WEEKS.map((w) => (
                <View
                  key={w.week}
                  style={[
                    styles.weekDot,
                    w.week < cbtiProgram.currentWeek && styles.weekDotComplete,
                    w.week === cbtiProgram.currentWeek && styles.weekDotCurrent,
                  ]}
                />
              ))}
            </View>

            {/* Prescription */}
            {prescription && cbtiProgram.currentWeek >= 2 && (
              <View style={styles.prescriptionRow}>
                <View style={styles.prescriptionItem}>
                  <Text style={styles.prescriptionLabel}>Bedtime</Text>
                  <Text style={styles.prescriptionValue}>{prescription.bedtime}</Text>
                </View>
                <View style={styles.prescriptionItem}>
                  <Text style={styles.prescriptionLabel}>Wake Time</Text>
                  <Text style={styles.prescriptionValue}>{prescription.wakeTime}</Text>
                </View>
                <View style={styles.prescriptionItem}>
                  <Text style={styles.prescriptionLabel}>Efficiency</Text>
                  <Text style={[
                    styles.prescriptionValue,
                    { color: (progress?.efficiency ?? 0) >= 85 ? colors.success : colors.dustyRose },
                  ]}>
                    {progress?.efficiency ?? '--'}%
                  </Text>
                </View>
              </View>
            )}

            {/* Today's lessons */}
            <View style={styles.lessonsPreview}>
              <Text style={styles.lessonsLabel}>This Week's Lessons</Text>
              {getLessonsForWeek(cbtiProgram.currentWeek).map((lesson) => (
                <Text key={lesson.id} style={styles.lessonTitle}>
                  {lesson.title}
                </Text>
              ))}
            </View>

            {/* Adherence */}
            {progress && (
              <View style={styles.adherenceRow}>
                <Text style={styles.adherenceLabel}>
                  Diary adherence: {progress.adherence}%
                </Text>
                <Text style={[
                  styles.trendLabel,
                  {
                    color:
                      progress.trend === 'improving'
                        ? colors.success
                        : progress.trend === 'declining'
                          ? colors.dustyRose
                          : colors.creamMuted,
                  },
                ]}>
                  {progress.trend === 'improving' ? 'Improving' : progress.trend === 'declining' ? 'Declining' : 'Stable'}
                </Text>
              </View>
            )}

            {cbtiProgram.status === 'paused' && (
              <Text style={styles.pausedLabel}>Program paused</Text>
            )}
          </View>
        )}

        {/* Section 2: Active Experiment */}
        {activeExperiment && (
          <>
            <Text style={styles.sectionTitle}>Active Experiment</Text>
            <View style={styles.experimentCard}>
              <View style={styles.expHeader}>
                <Text style={styles.expName}>{activeExperiment.name}</Text>
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>
                    {activeExperiment.completedNights}/{activeExperiment.totalNights} nights
                  </Text>
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(100, (activeExperiment.completedNights / activeExperiment.totalNights) * 100)}%`,
                    },
                  ]}
                />
              </View>
              <Pressable onPress={handleAbandonExperiment}>
                <Text style={styles.abandonText}>Abandon experiment</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Section 3: Suggested Remedies */}
        {suggestions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Suggested Remedies</Text>

            {/* Medical disclaimer for high BDI */}
            {(breathTrend?.bdi ?? 0) > 15 && (
              <View style={styles.disclaimerBanner}>
                <Text style={styles.disclaimerText}>
                  Your BDI is elevated. These suggestions are not medical advice.
                  Consider consulting a sleep specialist.
                </Text>
              </View>
            )}

            {suggestions.map((suggestion) => (
              <View key={suggestion.remedy.id} style={styles.remedyCard}>
                <View style={styles.remedyHeader}>
                  <Text style={styles.remedyName}>{suggestion.remedy.name}</Text>
                  <View style={[
                    styles.evidenceBadge,
                    suggestion.remedy.evidenceLevel === 'strong' && styles.evidenceStrong,
                  ]}>
                    <Text style={styles.evidenceText}>
                      {suggestion.remedy.evidenceLevel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.remedyReason}>{suggestion.reason}</Text>
                <Text style={styles.remedyDesc} numberOfLines={2}>
                  {suggestion.remedy.description}
                </Text>
                {!activeExperiment && (
                  <GlassButton
                    title="Try This"
                    onPress={() => {
                      // In a full implementation, navigate to experiment setup
                      Alert.alert(
                        `Try ${suggestion.remedy.name}`,
                        `This experiment runs for ${suggestion.remedy.experimentDuration} nights. Your baseline will be your recent sleep data.`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Start', onPress: () => {} },
                        ],
                      );
                    }}
                    size="small"
                    style={styles.tryButton}
                  />
                )}
              </View>
            ))}
          </>
        )}

        {/* Section 4: Past Experiments */}
        {pastExperiments.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Past Experiments</Text>
            {pastExperiments.map((exp) => (
              <View key={exp.id} style={styles.pastCard}>
                <View style={styles.pastHeader}>
                  <Text style={styles.pastName}>{exp.name}</Text>
                  <View style={[
                    styles.verdictBadge,
                    exp.status === 'complete' && exp.improvementPct != null && exp.improvementPct > 5
                      ? styles.verdictImproved
                      : exp.status === 'abandoned'
                        ? styles.verdictAbandoned
                        : styles.verdictNeutral,
                  ]}>
                    <Text style={styles.verdictText}>
                      {exp.status === 'abandoned'
                        ? 'Abandoned'
                        : exp.improvementPct != null && exp.improvementPct > 5
                          ? `+${exp.improvementPct}%`
                          : exp.improvementPct != null && exp.improvementPct < -5
                            ? `${exp.improvementPct}%`
                            : 'No change'}
                    </Text>
                  </View>
                </View>
                {exp.resultSummary && (
                  <Text style={styles.pastSummary}>{exp.resultSummary}</Text>
                )}
              </View>
            ))}
          </>
        )}

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
  title: {
    marginBottom: 24,
  },

  // CBT-I promo card
  cbtiPromoCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.25)',
    marginBottom: 24,
  },
  cbtiPromoTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 22,
    color: colors.lavender,
    marginBottom: 4,
  },
  cbtiPromoSubtitle: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  cbtiPromoBody: {
    ...textStyles.body,
    color: colors.creamMuted,
    lineHeight: 22,
    marginBottom: 20,
  },
  ctaButton: {
    marginBottom: 12,
  },
  learnMoreText: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.lavender,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // CBT-I active card
  cbtiActiveCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.2)',
    marginBottom: 24,
  },
  cbtiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cbtiActiveTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
  },
  weekBadge: {
    backgroundColor: 'rgba(184,160,210,0.2)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  weekBadgeText: {
    fontFamily: fonts.mono.medium,
    fontSize: 12,
    color: colors.lavender,
  },
  cbtiWeekFocus: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamMuted,
    marginBottom: 16,
  },
  weekDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  weekDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(240,235,224,0.1)',
  },
  weekDotComplete: {
    backgroundColor: colors.lavender,
  },
  weekDotCurrent: {
    backgroundColor: colors.lavender,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  prescriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(240,235,224,0.04)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  prescriptionItem: {
    alignItems: 'center',
  },
  prescriptionLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 10,
    color: colors.creamDim,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  prescriptionValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 16,
    color: colors.cream,
  },
  lessonsPreview: {
    marginBottom: 12,
  },
  lessonsLabel: {
    ...textStyles.label,
    color: colors.creamMuted,
    marginBottom: 6,
  },
  lessonTitle: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.cream,
    paddingVertical: 3,
  },
  adherenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamDim,
  },
  trendLabel: {
    fontFamily: fonts.mono.medium,
    fontSize: 12,
  },
  pausedLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.dustyRose,
    marginTop: 8,
    fontStyle: 'italic',
  },

  // Section titles
  sectionTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
    marginBottom: 12,
    marginTop: 8,
  },

  // Active experiment
  experimentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expName: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.cream,
    flex: 1,
  },
  durationBadge: {
    backgroundColor: 'rgba(184,160,210,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  durationText: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.lavender,
    letterSpacing: 1,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(240,235,224,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.lavender,
    borderRadius: 2,
  },
  abandonText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamDim,
    textDecorationLine: 'underline',
  },

  // Disclaimer
  disclaimerBanner: {
    backgroundColor: 'rgba(212,133,138,0.1)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(212,133,138,0.2)',
    marginBottom: 12,
  },
  disclaimerText: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.dustyRose,
    lineHeight: 18,
  },

  // Remedy cards
  remedyCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  remedyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  remedyName: {
    fontFamily: fonts.body.semiBold,
    fontSize: 15,
    color: colors.cream,
    flex: 1,
  },
  evidenceBadge: {
    backgroundColor: 'rgba(240,235,224,0.08)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  evidenceStrong: {
    backgroundColor: 'rgba(107,173,160,0.15)',
  },
  evidenceText: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remedyReason: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.lavender,
    marginBottom: 4,
  },
  remedyDesc: {
    ...textStyles.caption,
    color: colors.creamMuted,
    marginBottom: 10,
  },
  tryButton: {
    alignSelf: 'flex-start',
  },

  // Past experiments
  pastCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  pastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pastName: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.cream,
    flex: 1,
  },
  verdictBadge: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  verdictImproved: {
    backgroundColor: 'rgba(107,173,160,0.2)',
  },
  verdictAbandoned: {
    backgroundColor: 'rgba(212,133,138,0.15)',
  },
  verdictNeutral: {
    backgroundColor: 'rgba(240,235,224,0.08)',
  },
  verdictText: {
    fontFamily: fonts.mono.medium,
    fontSize: 10,
    color: colors.creamMuted,
    letterSpacing: 0.5,
  },
  pastSummary: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamDim,
    marginTop: 6,
  },
});
