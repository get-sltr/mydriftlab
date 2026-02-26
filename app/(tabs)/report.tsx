import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import Svg, { Path } from 'react-native-svg';
import { useAuthStore } from '../../stores/authStore';
import { useRecordingStore } from '../../stores/recordingStore';
import { useCBTIStore } from '../../stores/cbtiStore';
import { useExperimentStore } from '../../stores/experimentStore';
import { usePreferencesStore } from '../../stores/preferencesStore';
import { canAccessFeature } from '../../lib/freeTier';
import { getSessions } from '../../services/aws/sessions';
import { getSessionEvents } from '../../services/aws/events';
import { calculateRestScore } from '../../services/analysis/scoring';
import { writeNightSummary } from '../../services/analysis/summaryWriter';
import { generateInsights } from '../../services/analysis/insights';
import { eventCategories } from '../../lib/eventCategories';
import { ClipKeeper, type ClipManifest, type SegmentMeta } from '../../services/audio/clipKeeper';
import { shareReport, type ReportData } from '../../services/report/pdfGenerator';
import { colors, getScoreColor, getCategoryColor } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';
import type { SleepSession, EnvironmentEvent, Insight, BreathTrendSummary, SleepEfficiencyData } from '../../lib/types';
import ScoreRing from '../../components/report/ScoreRing';
import GlassButton from '../../components/ui/GlassButton';

export default function ReportScreen() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const tier = useAuthStore((s) => s.tier);

  // All hooks must be declared before any conditional returns (Rules of Hooks)
  const [session, setSession] = useState<SleepSession | null>(null);
  const [events, setEvents] = useState<EnvironmentEvent[]>([]);
  const [score, setScore] = useState(0);
  const [summary, setSummary] = useState('');
  const [insights, setInsights] = useState<Insight[]>([]);
  const [clips, setClips] = useState<ClipManifest | null>(null);
  const [playingClipId, setPlayingClipId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const clipSoundRef = useRef<Audio.Sound | null>(null);

  // New data from sonar/breathTrend
  const breathTrend = useRecordingStore((s) => s.breathTrend);
  const sleepEfficiency = useRecordingStore((s) => s.sleepEfficiency);
  const cbtiProgram = useCBTIStore((s) => s.program);
  const activeExperiment = useExperimentStore((s) => s.activeExperiment);
  const appleHealthEnabled = usePreferencesStore((s) => s.appleHealthEnabled);

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

      // Load available clips for this session
      const sessionClips = await ClipKeeper.getClipsForSession(latest.id);
      setClips(sessionClips);
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
      return () => {
        // Stop any playing clip on blur
        clipSoundRef.current?.unloadAsync().catch(() => {});
        clipSoundRef.current = null;
        setPlayingClipId(null);
      };
    }, [loadReport]),
  );

  // Play a clip segment for ~30s starting near the event timestamp
  const playClip = useCallback(async (segment: SegmentMeta, eventTimestamp: string) => {
    // Stop any currently playing clip
    if (clipSoundRef.current) {
      await clipSoundRef.current.unloadAsync().catch(() => {});
      clipSoundRef.current = null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: segment.file },
        { shouldPlay: false },
      );
      clipSoundRef.current = sound;

      // Seek to approximate event position within segment
      const eventMs = new Date(eventTimestamp).getTime();
      const offsetMs = Math.max(0, eventMs - segment.startMs - 5000); // 5s before event
      await sound.setPositionAsync(offsetMs);
      await sound.playAsync();

      const eventId = segment.eventIds[0] ?? segment.file;
      setPlayingClipId(eventId);

      // Stop after 30s
      setTimeout(async () => {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        if (clipSoundRef.current === sound) {
          clipSoundRef.current = null;
          setPlayingClipId(null);
        }
      }, 30000);

      // Also stop when playback finishes naturally
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && (status.didJustFinish || !status.isPlaying)) {
          setPlayingClipId(null);
        }
      });
    } catch {
      setPlayingClipId(null);
    }
  }, []);

  const [sharing, setSharing] = useState(false);

  const exportClip = useCallback(async (filePath: string) => {
    await ClipKeeper.exportClip(filePath);
  }, []);

  const handleShareReport = useCallback(async () => {
    if (!session || sharing) return;
    try {
      setSharing(true);
      const reportData: ReportData = {
        session,
        events,
        restScore: score,
        summary,
        insights,
        breathTrend,
        sleepEfficiency,
        cbtiProgram: cbtiProgram ?? null,
      };
      await shareReport(reportData);
    } catch {
      // Share cancelled or failed
    } finally {
      setSharing(false);
    }
  }, [session, events, score, summary, insights, breathTrend, sleepEfficiency, cbtiProgram, sharing]);

  // Find clip segment for a given event
  const findClipForEvent = useCallback((eventId: string): SegmentMeta | null => {
    if (!clips) return null;
    return clips.segments.find((s) => s.eventIds.includes(eventId)) ?? null;
  }, [clips]);

  // Gate for free users (after all hooks to satisfy Rules of Hooks)
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
            <GlassButton
              title="Upgrade to Pro"
              onPress={() => router.push('/upgrade')}
              size="large"
              style={styles.upgradeButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
              MyDriftLAB will analyze your sleep environment and give you a detailed
              breakdown of what happened overnight.
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>MyDriftLAB Insight</Text>
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

  // Group events by category while preserving full EnvironmentEvent type
  const grouped: Record<string, EnvironmentEvent[]> = {};
  for (const evt of events) {
    if (!grouped[evt.category]) grouped[evt.category] = [];
    grouped[evt.category].push(evt);
  }
  const daysUntilExpiry = session.startedAt
    ? ClipKeeper.daysUntilExpiry(session.startedAt.split('T')[0])
    : 0;
  const clipsExpired = daysUntilExpiry <= 0;

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

        {/* Event Breakdown with Clip Playback */}
        {events.length > 0 && (
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>Event Breakdown</Text>
            {Object.entries(grouped).map(([category, catEvents]) => {
              const info = eventCategories[category];
              const catColor = getCategoryColor(category);
              return (
                <View key={category}>
                  <View style={styles.breakdownRow}>
                    <View style={[styles.dot, { backgroundColor: catColor }]} />
                    <Text style={styles.breakdownLabel}>
                      {info?.label ?? category}
                    </Text>
                    <Text style={styles.breakdownCount}>{catEvents.length}</Text>
                  </View>
                  {/* Individual events with clip buttons */}
                  {catEvents.map((evt) => {
                    const clip = findClipForEvent(evt.id);
                    const isThisPlaying = playingClipId === evt.id;
                    const evtTime = new Date(evt.timestamp).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    });

                    return (
                      <View key={evt.id} style={styles.eventRow}>
                        <Text style={styles.eventTime}>{evtTime}</Text>
                        <Text style={styles.eventType} numberOfLines={1}>{evt.type}</Text>
                        {clip && !clipsExpired && (
                          <View style={styles.clipActions}>
                            <Pressable
                              onPress={() => playClip(clip, evt.timestamp)}
                              style={styles.clipButton}
                              accessibilityLabel={isThisPlaying ? 'Stop clip' : 'Play clip'}
                            >
                              <Text style={styles.clipButtonText}>
                                {isThisPlaying ? '||' : '  >'}
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={() => exportClip(clip.file)}
                              style={styles.clipButton}
                              accessibilityLabel="Share clip"
                            >
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path
                                  d="M7 17l9.2-9.2M17 17V7H7"
                                  stroke={colors.creamMuted}
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </Svg>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })}

            {/* Clip expiry notice */}
            {clips && clips.segments.length > 0 && (
              <Text style={styles.clipExpiry}>
                {clipsExpired
                  ? 'Audio clips have expired'
                  : `Audio clips expire in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}`}
              </Text>
            )}
          </View>
        )}

        {/* Sleep Efficiency Section (from sonar) */}
        {sleepEfficiency && sleepEfficiency.totalTimeInBedMinutes > 0 && (
          <View style={styles.efficiencyCard}>
            <Text style={styles.breakdownTitle}>Sleep Efficiency</Text>
            <View style={styles.efficiencyRow}>
              <View style={styles.efficiencyMain}>
                <Text style={[
                  styles.efficiencyValue,
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
                <Text style={styles.efficiencyLabel}>efficiency</Text>
              </View>
              <View style={styles.efficiencyBreakdown}>
                <Text style={styles.effMetric}>
                  Time in bed: {Math.floor(sleepEfficiency.totalTimeInBedMinutes / 60)}h {sleepEfficiency.totalTimeInBedMinutes % 60}m
                </Text>
                <Text style={styles.effMetric}>
                  Total sleep: {Math.floor(sleepEfficiency.totalSleepMinutes / 60)}h {sleepEfficiency.totalSleepMinutes % 60}m
                </Text>
                <Text style={styles.effMetric}>
                  Onset latency: {sleepEfficiency.sleepOnsetLatencyMinutes}m
                </Text>
                <Text style={styles.effMetric}>
                  WASO: {sleepEfficiency.wakeAfterSleepOnsetMinutes}m
                </Text>
              </View>
            </View>

            {/* Movement timeline */}
            {sleepEfficiency.movementTimeline.length > 0 && (
              <View style={styles.timelineRow}>
                {sleepEfficiency.movementTimeline.slice(-60).map((sample, i) => {
                  const c =
                    sample.sleepState === 'deep'
                      ? colors.lavender
                      : sample.sleepState === 'light'
                        ? 'rgba(184,160,210,0.4)'
                        : 'rgba(212,133,138,0.5)';
                  return (
                    <View
                      key={i}
                      style={[styles.timelineBand, { backgroundColor: c }]}
                    />
                  );
                })}
              </View>
            )}
            <View style={styles.timelineLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.lavender }]} />
                <Text style={styles.legendText}>Deep</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(184,160,210,0.4)' }]} />
                <Text style={styles.legendText}>Light</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: 'rgba(212,133,138,0.5)' }]} />
                <Text style={styles.legendText}>Awake</Text>
              </View>
            </View>
          </View>
        )}

        {/* BreathTrend Section */}
        {breathTrend && breathTrend.recordingHours > 0 && (
          <View style={styles.breathTrendCard}>
            <Text style={styles.breakdownTitle}>Breathing Analysis</Text>
            <View style={styles.bdiRow}>
              <View style={styles.bdiMain}>
                <Text style={[
                  styles.bdiValue,
                  {
                    color:
                      breathTrend.bdiSeverity === 'normal'
                        ? colors.success
                        : breathTrend.bdiSeverity === 'mild'
                          ? colors.temperature
                          : colors.dustyRose,
                  },
                ]}>
                  {breathTrend.bdi}
                </Text>
                <Text style={styles.bdiLabel}>BDI</Text>
                <Text style={styles.bdiSeverity}>{breathTrend.bdiSeverity}</Text>
              </View>
              <View style={styles.breathStats}>
                <Text style={styles.effMetric}>
                  Avg rate: {breathTrend.avgBreathingRate} bpm
                </Text>
                <Text style={styles.effMetric}>
                  Range: {breathTrend.minBreathingRate}–{breathTrend.maxBreathingRate} bpm
                </Text>
                <Text style={styles.effMetric}>
                  Regularity: {Math.round(breathTrend.avgRegularity * 100)}%
                </Text>
                <Text style={styles.effMetric}>
                  Disturbances: {breathTrend.disturbanceCount}
                </Text>
              </View>
            </View>

            {/* Breathing rate sparkline */}
            {breathTrend.snapshots.length > 0 && (
              <View style={styles.sparklineContainer}>
                {breathTrend.snapshots.slice(-30).map((snap, i) => {
                  const maxRate = 24;
                  const height = Math.max(4, (snap.breathingRate / maxRate) * 40);
                  return (
                    <View
                      key={i}
                      style={[
                        styles.sparkBar,
                        {
                          height,
                          backgroundColor: snap.disturbanceDetected
                            ? colors.dustyRose
                            : colors.lavender,
                        },
                      ]}
                    />
                  );
                })}
              </View>
            )}

            <Pressable onPress={() => router.push('/bdi-info')}>
              <Text style={styles.bdiInfoLink}>What is BDI?</Text>
            </Pressable>

            <Text style={styles.bdiDisclaimer}>
              BDI is an estimate from audio analysis, not a medical diagnosis.
            </Text>
          </View>
        )}

        {/* CBT-I Diary Check-in */}
        {cbtiProgram && cbtiProgram.status === 'active' && (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>Insomnia Fighter</Text>
            <Text style={styles.insightTitle}>
              Week {cbtiProgram.currentWeek} — Fill in your sleep diary
            </Text>
            <Text style={styles.insightText}>
              Record last night's sleep data in the Labs tab to keep your program on track.
              {cbtiProgram.currentWeek >= 2 &&
                ` Your prescribed bedtime is ${cbtiProgram.prescribedBedtime}.`}
            </Text>
          </View>
        )}

        {/* Experiment Check-in */}
        {activeExperiment && (
          <View style={styles.insightCard}>
            <Text style={styles.insightLabel}>Active Experiment</Text>
            <Text style={styles.insightTitle}>{activeExperiment.name}</Text>
            <Text style={styles.insightText}>
              Night {activeExperiment.completedNights + 1} of{' '}
              {activeExperiment.totalNights}. Log your adherence in the Labs tab.
            </Text>
          </View>
        )}

        {/* Insights */}
        {insights.map((insight) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightLabel}>
              {insight.type === 'encouragement' ? 'Encouragement' : 'MyDriftLAB Insight'}
            </Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightText}>{insight.body}</Text>
          </View>
        ))}

        {/* Share Actions */}
        <View style={styles.shareSection}>
          <GlassButton
            title={sharing ? 'Generating PDF...' : 'Share Report (PDF)'}
            onPress={handleShareReport}
            size="large"
            style={styles.shareButton}
            disabled={sharing}
          />
          <Text style={styles.shareHint}>
            Generate a comprehensive PDF report to share with your doctor
          </Text>

          {clips && clips.segments.length > 0 && !clipsExpired && (
            <>
              <GlassButton
                title="Export Audio Clips"
                onPress={() => {
                  if (clips.segments.length > 0) {
                    exportClip(clips.segments[0].file);
                  }
                }}
                size="large"
                style={styles.exportClipButton}
              />
              <Text style={styles.shareHint}>
                Save audio clips ({clips.segments.length} segment{clips.segments.length !== 1 ? 's' : ''}) — expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? 's' : ''}
              </Text>
            </>
          )}
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

  // Event rows with clip buttons
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 18,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,235,224,0.04)',
  },
  eventTime: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.creamDim,
    width: 65,
  },
  eventType: {
    ...textStyles.body,
    fontSize: 13,
    color: colors.creamMuted,
    flex: 1,
  },
  clipActions: {
    flexDirection: 'row',
    gap: 6,
  },
  clipButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(184,160,210,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipButtonText: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.lavender,
  },
  clipExpiry: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.creamDim,
    textAlign: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(240,235,224,0.05)',
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

  // Sleep Efficiency
  efficiencyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  efficiencyRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  efficiencyMain: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  efficiencyValue: {
    fontFamily: fonts.headline.light,
    fontSize: 36,
  },
  efficiencyLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  efficiencyBreakdown: {
    flex: 1,
    justifyContent: 'center',
  },
  effMetric: {
    fontFamily: fonts.mono.regular,
    fontSize: 12,
    color: colors.creamMuted,
    marginBottom: 3,
  },
  timelineRow: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timelineBand: {
    flex: 1,
    marginHorizontal: 0.5,
  },
  timelineLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamDim,
  },

  // BreathTrend
  breathTrendCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  bdiRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bdiMain: {
    alignItems: 'center',
    marginRight: 20,
    minWidth: 80,
  },
  bdiValue: {
    fontFamily: fonts.headline.light,
    fontSize: 36,
  },
  bdiLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bdiSeverity: {
    fontFamily: fonts.mono.medium,
    fontSize: 11,
    color: colors.creamMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  breathStats: {
    flex: 1,
    justifyContent: 'center',
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 44,
    gap: 2,
    marginBottom: 12,
  },
  sparkBar: {
    flex: 1,
    borderRadius: 2,
  },
  bdiInfoLink: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.lavender,
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  bdiDisclaimer: {
    fontFamily: fonts.body.light,
    fontSize: 11,
    color: colors.creamDim,
    fontStyle: 'italic',
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
  upgradeButton: {
    marginTop: 28,
    alignSelf: 'stretch',
  },

  // Share actions
  shareSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  shareButton: {
    width: '100%',
  },
  exportClipButton: {
    width: '100%',
    marginTop: 12,
  },
  shareHint: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamDim,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
});
