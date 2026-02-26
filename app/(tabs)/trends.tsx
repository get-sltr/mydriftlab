import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useRecordingStore } from '../../stores/recordingStore';
import { useCBTIStore } from '../../stores/cbtiStore';
import { useExperimentStore } from '../../stores/experimentStore';
import { getSessions } from '../../services/aws/sessions';
import { getSessionEvents } from '../../services/aws/events';
import { generateWeeklyReport } from '../../services/analysis/weeklyInsights';
import { colors, getScoreColor, getCategoryColor } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';
import type { SleepSession, WeeklyReport } from '../../lib/types';

const BAR_MAX_HEIGHT = 120;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface DayData {
  date: Date;
  score: number | null;
  dayLabel: string;
}

export default function TrendsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [days, setDays] = useState<DayData[]>([]);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);

  // New data sources
  const breathTrend = useRecordingStore((s) => s.breathTrend);
  const sleepEfficiency = useRecordingStore((s) => s.sleepEfficiency);
  const cbtiProgram = useCBTIStore((s) => s.program);
  const cbtiProgress = useCBTIStore((s) => s.getWeeklyProgress);
  const activeExperiment = useExperimentStore((s) => s.activeExperiment);

  const loadTrends = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessions = await getSessions(accessToken, 14);

      // Build a 14-day map (today going back 13 days)
      const now = new Date();
      const dayMap = new Map<string, SleepSession>();
      for (const s of sessions) {
        if (s.status === 'complete' && s.restScore != null && s.startedAt) {
          const key = new Date(s.startedAt).toISOString().slice(0, 10);
          dayMap.set(key, s);
        }
      }

      const result: DayData[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        const session = dayMap.get(key);
        result.push({
          date: d,
          score: session?.restScore ?? null,
          dayLabel: DAY_LABELS[d.getDay()],
        });
      }

      setDays(result);

      // Generate weekly report if we have at least 2 completed sessions in the past week
      const lastWeekSessions = sessions.filter((s) => {
        if (s.status !== 'complete') return false;
        const sessionDate = new Date(s.startedAt);
        const daysAgo = (now.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000);
        return daysAgo <= 7;
      });
      const prevWeekSessions = sessions.filter((s) => {
        if (s.status !== 'complete') return false;
        const sessionDate = new Date(s.startedAt);
        const daysAgo = (now.getTime() - sessionDate.getTime()) / (24 * 60 * 60 * 1000);
        return daysAgo > 7 && daysAgo <= 14;
      });

      if (lastWeekSessions.length >= 2) {
        // Fetch events for all recent sessions
        const currentWeekData = await Promise.all(
          lastWeekSessions.map(async (session) => ({
            session,
            events: await getSessionEvents(accessToken, session.id).catch(() => []),
          })),
        );
        const prevWeekData = await Promise.all(
          prevWeekSessions.map(async (session) => ({
            session,
            events: await getSessionEvents(accessToken, session.id).catch(() => []),
          })),
        );

        const report = generateWeeklyReport(currentWeekData, prevWeekData);
        setWeeklyReport(report);
      } else {
        setWeeklyReport(null);
      }
    } catch {
      setDays([]);
      setWeeklyReport(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useFocusEffect(
    useCallback(() => {
      loadTrends();
    }, [loadTrends]),
  );

  const scored = days.filter((d) => d.score !== null);
  const avg = scored.length > 0
    ? Math.round(scored.reduce((sum, d) => sum + d.score!, 0) / scored.length)
    : null;
  const best = scored.length > 0
    ? scored.reduce((b, d) => (d.score! > b.score! ? d : b))
    : null;
  const worst = scored.length > 0
    ? scored.reduce((w, d) => (d.score! < w.score! ? d : w))
    : null;

  const formatDayName = (d: Date) =>
    d.toLocaleDateString('en-US', { weekday: 'short' });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.lavender} />
        </View>
      </SafeAreaView>
    );
  }

  // Week-over-week delta
  const wowDelta = weeklyReport?.prevWeekAvgScore != null
    ? weeklyReport.avgScore - weeklyReport.prevWeekAvgScore
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>14-Day Overview</Text>

        {/* Average Score */}
        <View style={styles.avgCard}>
          <Text style={styles.avgLabel}>Average Rest Score</Text>
          <Text
            style={[
              styles.avgValue,
              { color: avg != null ? getScoreColor(avg) : colors.creamDim },
            ]}
          >
            {avg ?? '--'}
          </Text>
          {avg != null && (
            <Text style={[styles.avgTrend, { color: getScoreColor(avg) }]}>
              {scored.length} night{scored.length === 1 ? '' : 's'} recorded
            </Text>
          )}
          {avg == null && (
            <Text style={styles.avgTrend}>Start recording to see trends</Text>
          )}
          {/* Week-over-week comparison */}
          {wowDelta != null && (
            <Text
              style={[
                styles.wowDelta,
                { color: wowDelta >= 0 ? colors.success : colors.dustyRose },
              ]}
            >
              {wowDelta >= 0 ? '+' : ''}{wowDelta} points from last week
            </Text>
          )}
        </View>

        {/* Bar Chart */}
        <View style={styles.chartArea}>
          <View style={styles.chartBars}>
            {days.map((day, i) => {
              const hasScore = day.score !== null;
              const barHeight = hasScore
                ? Math.max(8, (day.score! / 100) * BAR_MAX_HEIGHT)
                : 8;
              const barColor = hasScore
                ? getScoreColor(day.score!)
                : 'rgba(240,235,224,0.08)';

              return (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.dayLabel}>{day.dayLabel}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Best / Worst */}
        {best && worst && scored.length >= 2 && (
          <Text style={styles.bestWorst}>
            Best night: {formatDayName(best.date)} ({best.score}) · Worst:{' '}
            {formatDayName(worst.date)} ({worst.score})
          </Text>
        )}

        {/* Weekly Report Section */}
        {weeklyReport && (
          <>
            {/* Day-by-day breakdown */}
            <Text style={styles.sectionTitle}>This Week</Text>
            {weeklyReport.dailyBreakdowns.map((day) => {
              if (day.score === null) return null;
              const isGood = day.score >= 80;
              const isBad = day.score < 60;

              return (
                <View key={day.date} style={styles.dayCard}>
                  <View style={styles.dayCardHeader}>
                    <Text style={styles.dayCardDay}>{day.dayLabel}</Text>
                    <Text
                      style={[
                        styles.dayCardScore,
                        { color: getScoreColor(day.score) },
                      ]}
                    >
                      {day.score}
                    </Text>
                  </View>
                  <Text style={styles.dayCardExplanation}>{day.explanation}</Text>
                  {day.topDisruptor && (
                    <View style={styles.disruptorBadge}>
                      <View
                        style={[
                          styles.disruptorDot,
                          { backgroundColor: getCategoryColor(day.topDisruptor) },
                        ]}
                      />
                      <Text style={styles.disruptorText}>
                        Top disruptor: {day.topDisruptor}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

            {/* Patterns */}
            {weeklyReport.patterns.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Patterns Detected</Text>
                {weeklyReport.patterns.map((pattern, i) => (
                  <View key={i} style={styles.patternCard}>
                    <View style={styles.patternHeader}>
                      <View
                        style={[
                          styles.patternIndicator,
                          {
                            backgroundColor:
                              pattern.impact === 'positive'
                                ? colors.success
                                : pattern.impact === 'negative'
                                  ? colors.dustyRose
                                  : colors.creamDim,
                          },
                        ]}
                      />
                      <Text style={styles.patternTitle}>{pattern.title}</Text>
                    </View>
                    <Text style={styles.patternBody}>{pattern.body}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Top Recommendation */}
            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationLabel}>Recommendation</Text>
              <Text style={styles.recommendationText}>
                {weeklyReport.topRecommendation}
              </Text>
            </View>
          </>
        )}

        {/* Sleep Efficiency Trend */}
        {sleepEfficiency && sleepEfficiency.totalTimeInBedMinutes > 0 && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Sleep Efficiency</Text>
              <Text style={[
                styles.metricValue,
                {
                  color:
                    sleepEfficiency.sleepEfficiency >= 85
                      ? colors.success
                      : sleepEfficiency.sleepEfficiency >= 70
                        ? colors.temperature
                        : colors.dustyRose,
                },
              ]}>
                {sleepEfficiency.sleepEfficiency}%
              </Text>
            </View>
            <Text style={styles.metricDetail}>
              {sleepEfficiency.totalSleepMinutes}m asleep / {sleepEfficiency.totalTimeInBedMinutes}m in bed
            </Text>
          </View>
        )}

        {/* BDI Trend */}
        {breathTrend && breathTrend.recordingHours > 0 && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Breathing Health</Text>
              <Text style={[
                styles.metricValue,
                {
                  color:
                    breathTrend.bdiSeverity === 'normal'
                      ? colors.success
                      : breathTrend.bdiSeverity === 'mild'
                        ? colors.temperature
                        : colors.dustyRose,
                },
              ]}>
                BDI {breathTrend.bdi}
              </Text>
            </View>
            <Text style={styles.metricDetail}>
              {breathTrend.bdiSeverity} · {breathTrend.disturbanceCount} disturbances in {breathTrend.recordingHours}h
            </Text>
          </View>
        )}

        {/* CBT-I Progress */}
        {cbtiProgram && cbtiProgram.status === 'active' && (() => {
          const progress = cbtiProgress();
          return (
            <View style={styles.cbtiTrendCard}>
              <View style={styles.metricHeader}>
                <Text style={styles.metricTitle}>Insomnia Fighter</Text>
                <Text style={styles.cbtiWeekText}>
                  Week {cbtiProgram.currentWeek} of 6
                </Text>
              </View>
              <Text style={styles.metricDetail}>
                Efficiency: {cbtiProgram.baselineSleepEfficiency}%
                {' → '}
                {progress.efficiency}%
                {progress.trend === 'improving' && ' (improving)'}
                {progress.trend === 'declining' && ' (declining)'}
              </Text>
              {/* Week dots */}
              <View style={styles.cbtiDots}>
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <View
                    key={w}
                    style={[
                      styles.cbtiDot,
                      w < cbtiProgram.currentWeek && styles.cbtiDotDone,
                      w === cbtiProgram.currentWeek && styles.cbtiDotCurrent,
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })()}

        {/* Active Experiment overlay hint */}
        {activeExperiment && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricTitle}>Experiment</Text>
              <Text style={styles.metricValue}>
                {activeExperiment.completedNights}/{activeExperiment.totalNights}
              </Text>
            </View>
            <Text style={styles.metricDetail}>
              {activeExperiment.name} · {activeExperiment.completedNights} nights logged
            </Text>
          </View>
        )}

        {/* Unlock message */}
        {scored.length < 7 && !weeklyReport && (
          <View style={styles.unlockCard}>
            <Text style={styles.unlockText}>
              More insights unlock after 7 nights
            </Text>
            {scored.length > 0 && (
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(scored.length / 7) * 100}%` },
                  ]}
                />
              </View>
            )}
          </View>
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Average card
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
  wowDelta: {
    fontFamily: fonts.mono.medium,
    fontSize: 13,
    marginTop: 8,
  },

  // Chart
  chartArea: {
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 24,
    paddingHorizontal: 2,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: 16,
    borderRadius: 4,
  },
  dayLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamDim,
    marginTop: 6,
  },

  // Best / Worst
  bestWorst: {
    ...textStyles.caption,
    color: colors.creamMuted,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Section titles
  sectionTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
    marginTop: 8,
    marginBottom: 12,
  },

  // Day cards
  dayCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayCardDay: {
    fontFamily: fonts.body.semiBold,
    fontSize: 15,
    color: colors.cream,
  },
  dayCardScore: {
    fontFamily: fonts.mono.medium,
    fontSize: 20,
  },
  dayCardExplanation: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.creamMuted,
    lineHeight: 18,
  },
  disruptorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  disruptorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  disruptorText: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.creamDim,
    textTransform: 'capitalize',
  },

  // Patterns
  patternCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 8,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  patternIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  patternTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.cream,
  },
  patternBody: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.creamMuted,
    lineHeight: 18,
  },

  // Recommendation
  recommendationCard: {
    backgroundColor: 'rgba(184,160,210,0.08)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
    marginTop: 8,
    marginBottom: 16,
  },
  recommendationLabel: {
    ...textStyles.label,
    color: colors.lavender,
    marginBottom: 8,
  },
  recommendationText: {
    ...textStyles.body,
    color: colors.cream,
    lineHeight: 20,
  },

  // New metric cards
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 14,
    color: colors.cream,
  },
  metricValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 16,
    color: colors.lavender,
  },
  metricDetail: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamDim,
    textTransform: 'capitalize',
  },
  cbtiTrendCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
    marginBottom: 10,
  },
  cbtiWeekText: {
    fontFamily: fonts.mono.medium,
    fontSize: 12,
    color: colors.lavender,
  },
  cbtiDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  cbtiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(240,235,224,0.1)',
  },
  cbtiDotDone: {
    backgroundColor: colors.lavender,
  },
  cbtiDotCurrent: {
    backgroundColor: colors.lavender,
    borderWidth: 2,
    borderColor: colors.cream,
  },

  // Unlock
  unlockCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  unlockText: {
    ...textStyles.caption,
    color: colors.creamMuted,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(240,235,224,0.08)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    backgroundColor: colors.lavender,
    borderRadius: 2,
  },
});
