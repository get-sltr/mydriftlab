import { Pressable, View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { ContentItem } from '../../lib/types';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

interface ContentCardProps {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
  size?: 'standard' | 'wide';
  locked?: boolean;
}

/** Map content category to a subtle background tint */
function getCategoryTint(category: string): [string, string] {
  switch (category) {
    case 'rain':
      return ['rgba(123,143,212,0.12)', 'rgba(123,143,212,0.03)'];
    case 'ocean':
      return ['rgba(107,159,212,0.12)', 'rgba(107,159,212,0.03)'];
    case 'forest':
      return ['rgba(107,173,160,0.12)', 'rgba(107,173,160,0.03)'];
    case 'city_night':
      return ['rgba(212,186,106,0.10)', 'rgba(212,186,106,0.02)'];
    case 'white_noise':
      return ['rgba(184,160,210,0.10)', 'rgba(184,160,210,0.02)'];
    case 'breathing':
      return ['rgba(184,160,210,0.15)', 'rgba(212,133,138,0.05)'];
    case 'meditation':
      return ['rgba(184,160,210,0.10)', 'rgba(184,160,210,0.02)'];
    default:
      return ['rgba(184,160,210,0.08)', 'rgba(184,160,210,0.02)'];
  }
}

function formatDuration(seconds: number): string {
  if (seconds === 0) return '∞';
  const mins = Math.round(seconds / 60);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins} min`;
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    rain: 'Rain',
    ocean: 'Ocean',
    forest: 'Forest',
    city_night: 'City',
    white_noise: 'Noise',
    breathing: 'Breathe',
    meditation: 'Meditate',
    travel: 'Travel',
    nature: 'Nature',
  };
  return labels[category] ?? category;
}

export default function ContentCard({
  item,
  onPress,
  size = 'standard',
  locked = false,
}: ContentCardProps) {
  const tint = getCategoryTint(item.category);
  const isWide = size === 'wide';

  return (
    <Pressable
      onPress={() => onPress(item)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}, ${getCategoryLabel(item.category)}, ${formatDuration(item.durationSeconds)}${locked ? ', Pro required' : ''}`}
      accessibilityHint={locked ? 'Double tap to upgrade' : 'Double tap to play'}
      style={({ pressed }) => [
        styles.card,
        isWide ? styles.cardWide : styles.cardStandard,
        pressed && styles.pressed,
        locked && styles.cardLocked,
      ]}
    >
      <LinearGradient
        colors={tint}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Gradient border glow */}
      <View style={styles.borderGlow} />

      <View style={styles.content}>
        {/* Category tag + lock/pro badge */}
        <View style={styles.tagRow}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>
          {locked && (
            <View style={styles.lockBadge}>
              <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zm-2 0V7a5 5 0 00-10 0v4"
                  stroke={colors.lavender}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.lockText}>PRO</Text>
            </View>
          )}
        </View>

        {/* Title + description + duration at bottom */}
        <View style={styles.bottom}>
          <Text style={[styles.title, locked && styles.textLocked]} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={[styles.description, locked && styles.textLocked]} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.duration}>
            {formatDuration(item.durationSeconds)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    position: 'relative',
  },
  cardStandard: {
    width: 150,
    height: 130,
  },
  cardWide: {
    width: 200,
    height: 140,
  },
  cardLocked: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  borderGlow: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  tagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(240,235,224,0.06)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontFamily: fonts.mono.regular,
    fontSize: 9,
    color: colors.creamMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(184,160,210,0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  lockText: {
    fontFamily: fonts.mono.medium,
    fontSize: 8,
    color: colors.lavender,
    letterSpacing: 1,
  },
  bottom: {},
  description: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: colors.creamDim,
    lineHeight: 13,
    marginBottom: 2,
  },
  textLocked: {
    color: colors.creamDim,
  },
  title: {
    fontFamily: fonts.body.medium,
    fontSize: 14,
    color: colors.cream,
    lineHeight: 18,
    marginBottom: 4,
  },
  duration: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.creamDim,
  },
});
