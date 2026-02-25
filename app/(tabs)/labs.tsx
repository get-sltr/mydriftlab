import { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { getSessions } from '../../services/aws/sessions';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

const experimentTemplates = [
  {
    name: 'Thermostat Challenge',
    description: 'Test how lowering your thermostat 2°F affects your Rest Score.',
  },
  {
    name: 'White Noise + Fan',
    description: 'Run a fan or white noise machine for 7 nights and compare.',
  },
  {
    name: 'Blackout Curtains',
    description: 'Block all light sources and measure the impact on disruptions.',
  },
  {
    name: 'Humidifier Test',
    description: 'Add a humidifier and track comfort and disruption changes.',
  },
];

export default function LabsScreen() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const [nightCount, setNightCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!accessToken) return;
      getSessions(accessToken, 100)
        .then((sessions) => {
          setNightCount(sessions.filter((s) => s.status === 'complete').length);
        })
        .catch(() => {});
    }, [accessToken]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Sleep Experiments</Text>

        {/* Night count + progress */}
        <View style={styles.nightCountCard}>
          <Text style={styles.nightCountText}>
            {nightCount} night{nightCount === 1 ? '' : 's'} recorded
          </Text>
          {nightCount < 7 && (
            <>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(100, (nightCount / 7) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressLabel}>
                {7 - nightCount} more night{7 - nightCount === 1 ? '' : 's'} to unlock experiments
              </Text>
            </>
          )}
        </View>

        {/* Coming soon card */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Coming in next update</Text>
          <Text style={styles.comingSoonBody}>
            Run structured 7-night experiments to discover what actually improves
            your sleep. One variable at a time. Real data.
          </Text>
        </View>

        {/* Locked experiment templates */}
        {experimentTemplates.map((exp, i) => (
          <View key={i} style={styles.experimentCard}>
            <View style={styles.lockBadge}>
              <Text style={styles.lockText}>Soon</Text>
            </View>
            <Text style={styles.expName}>{exp.name}</Text>
            <Text style={styles.expDesc}>{exp.description}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    ...textStyles.h1,
    color: colors.cream,
    marginBottom: 24,
  },
  comingSoonCard: {
    backgroundColor: colors.glassBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 24,
  },
  comingSoonTitle: {
    ...textStyles.h3,
    color: colors.lavender,
    marginBottom: 8,
  },
  comingSoonBody: {
    ...textStyles.body,
    color: colors.creamMuted,
  },
  experimentCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.08)',
    opacity: 0.5,
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(184,160,210,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lockText: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.lavender,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  expName: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.cream,
    marginBottom: 4,
  },
  expDesc: {
    ...textStyles.caption,
    color: colors.creamDim,
  },
  nightCountCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  nightCountText: {
    fontFamily: fonts.mono.medium,
    fontSize: 14,
    color: colors.cream,
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
  progressLabel: {
    ...textStyles.caption,
    color: colors.creamDim,
    marginTop: 8,
  },
});
