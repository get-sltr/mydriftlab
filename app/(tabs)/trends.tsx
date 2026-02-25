import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { getSessions } from '../../services/aws/sessions';
import { colors, getScoreColor } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';
import type { SleepSession } from '../../lib/types';

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
  const [loading, setLoading] = useState(true);

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
    } catch {
      setDays([]);
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

        {/* Unlock message */}
        {scored.length < 7 && (
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
