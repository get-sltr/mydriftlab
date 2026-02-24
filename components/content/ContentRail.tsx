import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ContentCard from './ContentCard';
import { ContentItem } from '../../lib/types';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

interface ContentRailProps {
  title: string;
  items: ContentItem[];
  onItemPress: (item: ContentItem) => void;
  cardSize?: 'standard' | 'wide';
}

export default function ContentRail({
  title,
  items,
  onItemPress,
  cardSize = 'standard',
}: ContentRailProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {items.map((item) => (
          <ContentCard
            key={item.id}
            item={item}
            onPress={onItemPress}
            size={cardSize}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.headline.medium,
    fontSize: 20,
    color: colors.cream,
    marginBottom: 14,
    marginLeft: 4,
    textShadowColor: 'rgba(184,160,210,0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  scrollContent: {
    gap: 12,
    paddingRight: 24,
  },
});
