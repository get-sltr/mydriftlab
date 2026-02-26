import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FloatingParticles from '../../components/ui/FloatingParticles';
import FilmGrain from '../../components/ui/FilmGrain';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import RoutineCard from '../../components/content/RoutineCard';
import ContentRail from '../../components/content/ContentRail';
import { ContentItem } from '../../lib/types';
import { useAuthStore } from '../../stores/authStore';
import { useCBTIStore } from '../../stores/cbtiStore';
import { cbtiLessons } from '../../data/cbtiContent';
import { canAccess } from '../../lib/freeTier';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

// Load sample content
import sampleContent from '../../data/sampleContent.json';

export default function DriftScreen() {
  const router = useRouter();
  const tier = useAuthStore((s) => s.tier);
  const cbtiProgram = useCBTIStore((s) => s.program);
  const hour = new Date().getHours();
  const greeting =
    hour < 5
      ? 'Good night'
      : hour < 12
        ? 'Good morning'
        : hour < 17
          ? 'Good afternoon'
          : 'Good evening';

  const subtitle =
    hour >= 19 || hour < 5
      ? 'Time to wind down'
      : hour < 12
        ? 'Planning tonight?'
        : 'Your evening starts here';

  const allContent = sampleContent as ContentItem[];

  // Group content by type
  const stories = useMemo(
    () => allContent.filter((c) => c.type === 'story'),
    [],
  );
  const soundscapes = useMemo(
    () => allContent.filter((c) => c.type === 'soundscape'),
    [],
  );
  const meditations = useMemo(
    () =>
      allContent.filter(
        (c) => c.type === 'meditation' || c.type === 'breathing',
      ),
    [],
  );

  // Build set of locked IDs for the current user's tier
  const lockedIds = useMemo(() => {
    if (tier === 'pro') return undefined;
    const ids = new Set<string>();
    for (const item of allContent) {
      if (!canAccess(item.id, tier)) {
        ids.add(item.id);
      }
    }
    return ids;
  }, [tier]);

  const handleContentPress = useCallback(
    (item: ContentItem) => {
      // Block locked content — navigate to paywall
      if (!canAccess(item.id, tier)) {
        router.push('/upgrade');
        return;
      }

      if (item.type === 'breathing') {
        router.push({
          pathname: '/breathing',
          params: {
            title: item.title,
            category: item.category,
          },
        });
      } else {
        router.push({
          pathname: '/player',
          params: {
            id: item.id,
            title: item.title,
            category: item.category,
            duration: String(item.durationSeconds),
            type: item.type,
          },
        });
      }
    },
    [router, tier],
  );

  const handleStartWindDown = useCallback(() => {
    router.push('/(tabs)/record');
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Atmospheric background */}
      <FloatingParticles count={22} colorScheme="default" />
      <FilmGrain />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <GlowText style={styles.greeting}>{greeting}</GlowText>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Personalized routine card */}
          <RoutineCard hasHistory={false} />

          {/* CBT-I Lesson Rail */}
          {cbtiProgram && cbtiProgram.status === 'active' ? (
            <View style={styles.cbtiRail}>
              <Text style={styles.railTitle}>Insomnia Fighter — Week {cbtiProgram.currentWeek}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.cbtiRailContent}
              >
                {cbtiLessons.map((lesson) => {
                  const isAvailable = lesson.week <= cbtiProgram.currentWeek;
                  const isCurrent = lesson.week === cbtiProgram.currentWeek;
                  return (
                    <Pressable
                      key={lesson.id}
                      style={[
                        styles.cbtiLessonCard,
                        !isAvailable && styles.cbtiLessonLocked,
                        isCurrent && styles.cbtiLessonCurrent,
                      ]}
                      disabled={!isAvailable}
                      onPress={() => {
                        if (lesson.audioId) {
                          router.push({
                            pathname: '/player',
                            params: {
                              id: lesson.audioId,
                              title: lesson.title,
                              category: 'cbti',
                              duration: String(lesson.estimatedMinutes * 60),
                              type: 'meditation',
                            },
                          });
                        }
                      }}
                    >
                      <Text style={styles.cbtiWeekLabel}>Week {lesson.week}</Text>
                      <Text
                        style={[
                          styles.cbtiLessonTitle,
                          !isAvailable && styles.cbtiLessonTitleLocked,
                        ]}
                        numberOfLines={2}
                      >
                        {lesson.title}
                      </Text>
                      <View style={styles.cbtiLessonMeta}>
                        <Text style={styles.cbtiLessonType}>{lesson.type}</Text>
                        <Text style={styles.cbtiLessonDuration}>
                          {lesson.estimatedMinutes}m
                        </Text>
                      </View>
                      {!isAvailable && (
                        <Text style={styles.cbtiLockedText}>Locked</Text>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : (
            <Pressable
              style={styles.cbtiPromoCard}
              onPress={() => router.push('/(tabs)/labs')}
            >
              <Text style={styles.cbtiPromoTitle}>Insomnia Fighter</Text>
              <Text style={styles.cbtiPromoBody}>
                6-week CBT-I program — the clinical gold standard for better sleep
              </Text>
              <Text style={styles.cbtiPromoLink}>Start in Labs →</Text>
            </Pressable>
          )}

          {/* Content rails */}
          <ContentRail
            title="Sleep Stories"
            items={stories}
            onItemPress={handleContentPress}
            cardSize="wide"
            lockedIds={lockedIds}
          />

          <ContentRail
            title="Soundscapes"
            items={soundscapes}
            onItemPress={handleContentPress}
            lockedIds={lockedIds}
          />

          <ContentRail
            title="Meditations"
            items={meditations}
            onItemPress={handleContentPress}
            lockedIds={lockedIds}
          />

          {/* Primary CTA */}
          <View style={styles.ctaContainer}>
            <GlassButton
              title="Start Wind Down + Monitoring"
              onPress={handleStartWindDown}
              size="large"
              style={styles.ctaButton}
            />
            <Text style={styles.ctaHint}>
              Plays your routine, then monitors overnight
            </Text>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  greeting: {
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fonts.body.light,
    fontSize: 15,
    color: colors.creamMuted,
    marginBottom: 28,
  },
  // CBT-I rail
  cbtiRail: {
    marginBottom: 24,
  },
  railTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
    marginBottom: 12,
  },
  cbtiRailContent: {
    paddingRight: 24,
    gap: 12,
  },
  cbtiLessonCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
  },
  cbtiLessonLocked: {
    opacity: 0.4,
    borderColor: 'rgba(240,235,224,0.06)',
  },
  cbtiLessonCurrent: {
    borderColor: colors.lavender,
    backgroundColor: 'rgba(184,160,210,0.08)',
  },
  cbtiWeekLabel: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    color: colors.creamDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  cbtiLessonTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 13,
    color: colors.cream,
    marginBottom: 8,
  },
  cbtiLessonTitleLocked: {
    color: colors.creamDim,
  },
  cbtiLessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cbtiLessonType: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    color: colors.creamMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cbtiLessonDuration: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    color: colors.creamDim,
  },
  cbtiLockedText: {
    fontFamily: fonts.body.light,
    fontSize: 10,
    color: colors.creamDim,
    fontStyle: 'italic',
    marginTop: 6,
  },
  cbtiPromoCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
    marginBottom: 24,
  },
  cbtiPromoTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 16,
    color: colors.lavender,
    marginBottom: 4,
  },
  cbtiPromoBody: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.creamMuted,
    marginBottom: 8,
  },
  cbtiPromoLink: {
    fontFamily: fonts.body.medium,
    fontSize: 13,
    color: colors.lavender,
  },

  ctaContainer: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  ctaButton: {
    width: '100%',
  },
  ctaHint: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: colors.creamDim,
    marginTop: 10,
  },
});
