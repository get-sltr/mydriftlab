import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../../stores/authStore';
import { canAccessFeature } from '../../lib/freeTier';
import { getSessions } from '../../services/aws/sessions';
import { getSessionEvents } from '../../services/aws/events';
import { calculateRestScore } from '../../services/analysis/scoring';
import { writeNightSummary } from '../../services/analysis/summaryWriter';
import { generateInsights } from '../../services/analysis/insights';
import { groupEventsByCategory, eventCategories } from '../../lib/eventCategories';
import { colors, getScoreColor, getCategoryColor } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';
import type { SleepSession, EnvironmentEvent, Insight } from '../../lib/types';
import ScoreRing from '../../components/report/ScoreRing';

export default function ReportScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tier = useAuthStore((s) => s.tier);

  // Gate for free users
  if (!canAccessFeature('morningReport', tier)) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Morning Report</Text>

          <View style={styles.lockedContainer}>
            <View style={styles.lockedIconWrap}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zm-2 0V7a5 5 0 00-10 0v4"
                  stroke={colors.lavender}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={styles.lockedTitle}>Pro Feature</Text>
            <Text style={styles.lockedBody}>
              Upgrade to Pro to unlock your full morning report with rest scores,
              environment breakdowns, and personalized insights.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  const [session, setSession] = useState<SleepSession | null>(null);
  const [events, setEvents] = useState<EnvironmentEvent[]>([]);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReport = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const sessions = await getSessions(accessToken, 1);
      const latest = sessions[0];

      if (!latest || latest.status !== 'complete') {
        setSession(null);
        setLoading(false);
        return;
      }

      setSession(latest);

      // Use pre-computed score if available, otherwise compute from events
      const sessionEvents = await getSessionEvents(accessToken, latest.id);
      setEvents(sessionEvents);

      const restScore = latest.restScore ?? calculateRestScore(sessionEvents, false);
      setScore(restScore);

      const durationMs =
        latest.endedAt && latest.startedAt
          ? new Date(latest.endedAt).getTime() - new Date(latest.startedAt).getTime()
          : 0;
      const durationMinutes = Math.round(durationMs / 60000);

      const nightSummary =
        latest.nightSummary ?? writeNightSummary(sessionEvents, durationMinutes, restScore);
      setSummary(nightSummary);

      setInsights(generateInsights(sessionEvents, restScore));
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  // Reload when tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadReport();
    }, [loadReport]),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.lavender} />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Morning Report</Text>

          <View style={styles.emptyScoreContainer}>
            <View style={styles.emptyScoreRing}>
              <Text style={styles.emptyScoreText}>--</Text>
            </View>
            <Text style={styles.emptyScoreLabel}>No data yet</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryText}>
              Start your first night of monitoring to see your morning report here.
              DriftLab will analyze your sleep environment and give you a detailed
              breakdown of what happened overnight.
            </Text>
          </View>

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

  // Data-driven report
  const durationMs =
    session.endedAt && session.startedAt
      ? new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()
      : 0;
  const durationMinutes = Math.round(durationMs / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const mins = durationMinutes % 60;
  const durationFormatted = `${hours}h ${String(mins).padStart(2, '0')}m`;

  const startTime = new Date(session.startedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = session.endedAt
    ? new Date(session.endedAt).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '--';

  const grouped = groupEventsByCategory(events);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>Morning Report</Text>

        {/* Score Ring */}
        <ScoreRing score={score} />

        {/* Sleep Duration */}
        <View style={styles.durationRow}>
          <Text style={styles.durationValue}>{durationFormatted}</Text>
          <Text style={styles.durationTimes}>
            {startTime} — {endTime}
          </Text>
        </View>

        {/* Night Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Event Breakdown */}
        {events.length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Event Breakdown</Text>
            {Object.entries(grouped).map(([category, catEvents]) => {
              const info = eventCategories[category];
              const catColor = getCategoryColor(category);
              return (
                <View key={category} style={styles.breakdownRow}>
                  <View style={[styles.dot, { backgroundColor: catColor }]} />
                  <Text style={styles.breakdownLabel}>
                    {info?.label ?? category}
                  </Text>
                  <Text style={styles.breakdownCount}>{catEvents.length}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Insights */}
        {insights.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightLabel}>
              {insight.type === 'encouragement' ? 'Encouragement' : 'DriftLab Insight'}
            </Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightText}>{insight.body}</Text>
          </View>
        ))}

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

  // Duration
  durationRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  durationValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 28,
    color: colors.cream,
    marginBottom: 4,
  },
  durationTimes: {
    ...textStyles.caption,
    color: colors.creamMuted,
  },

  // Summary
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

  // Breakdown
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  breakdownTitle: {
    ...textStyles.label,
    color: colors.creamMuted,
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  breakdownLabel: {
    ...textStyles.body,
    color: colors.cream,
    flex: 1,
  },
  breakdownCount: {
    fontFamily: fonts.mono.regular,
    fontSize: 14,
    color: colors.creamMuted,
  },

  // Insights
  insightCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 12,
  },
  insightLabel: {
    ...textStyles.label,
    color: colors.lavender,
    marginBottom: 8,
  },
  insightTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.cream,
    marginBottom: 6,
  },
  insightText: {
    ...textStyles.body,
    color: colors.creamMuted,
  },

  // Empty state
  emptyScoreContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  emptyScoreRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.creamDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyScoreText: {
    fontFamily: fonts.headline.light,
    fontSize: 48,
    color: colors.creamDim,
  },
  emptyScoreLabel: {
    ...textStyles.caption,
    color: colors.creamMuted,
  },

  // Locked / Pro gate
  lockedContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  lockedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(184,160,210,0.1)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 22,
    color: colors.cream,
    marginBottom: 12,
  },
  lockedBody: {
    ...textStyles.body,
    color: colors.creamMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
