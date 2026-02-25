/**
 * EventToast — glass morphism notification card
 * Spring slide-up from bottom + fade in.
 * Shows category dot, event type label, severity, and time.
 * Auto fade-out handled by recordingStore (5s timer).
 */

import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';
import { getCategoryColor } from '../../lib/colors';
import { eventTypeLabels } from '../../lib/eventCategories';
import type { EnvironmentEvent } from '../../lib/types';

interface EventToastProps {
  event: Partial<EnvironmentEvent> | null;
  onDismiss?: () => void;
}

export default function EventToast({ event, onDismiss }: EventToastProps) {
  const translateY = useSharedValue(80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (event) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      opacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(80, { duration: 300 });
    }
  }, [event]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!event) return null;

  const categoryColor = getCategoryColor(event.category ?? 'noise');
  const typeLabel = eventTypeLabels[event.type ?? ''] ?? event.type ?? 'Event';
  const severity = event.severity ?? 'low';
  const time = event.timestamp
    ? new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.card}>
        {/* Category dot */}
        <View style={[styles.dot, { backgroundColor: categoryColor }]} />

        <View style={styles.content}>
          <Text style={styles.typeLabel}>{typeLabel}</Text>
          <View style={styles.meta}>
            <Text style={styles.severity}>{severity.toUpperCase()}</Text>
            {event.decibelLevel != null && (
              <Text style={styles.db}>{event.decibelLevel} dB</Text>
            )}
            {time ? <Text style={styles.time}>{time}</Text> : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    right: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glassBackground,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    flex: 1,
  },
  typeLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.cream,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  severity: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamMuted,
    letterSpacing: 1,
  },
  db: {
    fontFamily: fonts.mono.regular,
    fontSize: 10,
    color: colors.creamMuted,
  },
  time: {
    fontFamily: fonts.mono.light,
    fontSize: 10,
    color: colors.creamDim,
  },
});
