import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FloatingParticles from '../../components/ui/FloatingParticles';
import FilmGrain from '../../components/ui/FilmGrain';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import RoutineCard from '../../components/content/RoutineCard';
import ContentRail from '../../components/content/ContentRail';
import { ContentItem } from '../../lib/types';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

// Load sample content
import sampleContent from '../../data/sampleContent.json';

export default function DriftScreen() {
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

  // Group content by type
  const stories = useMemo(
    () =>
      (sampleContent as ContentItem[]).filter((c) => c.type === 'story'),
    [],
  );
  const soundscapes = useMemo(
    () =>
      (sampleContent as ContentItem[]).filter(
        (c) => c.type === 'soundscape',
      ),
    [],
  );
  const meditations = useMemo(
    () =>
      (sampleContent as ContentItem[]).filter(
        (c) => c.type === 'meditation' || c.type === 'breathing',
      ),
    [],
  );

  const handleContentPress = useCallback((item: ContentItem) => {
    // TODO: Navigate to content player (Step 4)
    console.log('Content pressed:', item.title);
  }, []);

  const handleStartWindDown = useCallback(() => {
    // TODO: Start wind-down + recording flow (Step 6)
    console.log('Start Wind Down + Monitoring');
  }, []);

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

          {/* Content rails */}
          <ContentRail
            title="Sleep Stories"
            items={stories}
            onItemPress={handleContentPress}
            cardSize="wide"
          />

          <ContentRail
            title="Soundscapes"
            items={soundscapes}
            onItemPress={handleContentPress}
          />

          <ContentRail
            title="Meditations"
            items={meditations}
            onItemPress={handleContentPress}
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
