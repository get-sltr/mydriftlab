import { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import GlassButton from '../components/ui/GlassButton';
import FloatingParticles from '../components/ui/FloatingParticles';
import FilmGrain from '../components/ui/FilmGrain';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../lib/colors';
import { fonts, textStyles } from '../lib/typography';

const FEATURES = [
  { icon: 'book', label: '20 sleep stories narrated to help you drift off' },
  { icon: 'music', label: 'Full soundscape library — rain, ocean, forest & more' },
  { icon: 'wind', label: 'Guided breathing exercises for deep relaxation' },
  { icon: 'sun', label: 'Detailed morning report with rest score & insights' },
  { icon: 'chart', label: 'Sleep trends & analytics over time' },
  { icon: 'flask', label: 'Labs — experimental sleep tools & features' },
];

function FeatureIcon({ icon }: { icon: string }) {
  const size = 20;
  const stroke = colors.lavender;
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };

  switch (icon) {
    case 'book':
      return (
        <Svg {...props}>
          <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'music':
      return (
        <Svg {...props}>
          <Path d="M9 18V5l12-2v13" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M6 21a3 3 0 100-6 3 3 0 000 6zM18 19a3 3 0 100-6 3 3 0 000 6z" stroke={stroke} strokeWidth={2} />
        </Svg>
      );
    case 'wind':
      return (
        <Svg {...props}>
          <Path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'sun':
      return (
        <Svg {...props}>
          <Path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
          <Path d="M12 17a5 5 0 100-10 5 5 0 000 10z" stroke={stroke} strokeWidth={2} />
        </Svg>
      );
    case 'chart':
      return (
        <Svg {...props}>
          <Path d="M18 20V10M12 20V4M6 20v-6" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    case 'flask':
      return (
        <Svg {...props}>
          <Path d="M9 3h6m-5 0v5.172a2 2 0 01-.586 1.414l-4.828 4.828A2 2 0 006 18h12a2 2 0 001.414-3.414l-4.828-4.828A2 2 0 0114 8.172V3" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );
    default:
      return null;
  }
}

export default function UpgradeScreen() {
  const router = useRouter();
  const tier = useAuthStore((s) => s.tier);
  const { isReady, isLoading, product, error, init, purchase, restore } =
    useSubscriptionStore();

  useEffect(() => {
    if (!isReady) init();
  }, [isReady]);

  // If user is already pro, show confirmation and go back
  useEffect(() => {
    if (tier === 'pro') {
      router.back();
    }
  }, [tier]);

  const priceLabel = product ? `${(product as any).localizedPrice ?? '$4.99'}/month` : '$4.99/month';

  return (
    <View style={styles.container}>
      <FloatingParticles count={14} colorScheme="default" />
      <FilmGrain />

      <SafeAreaView style={styles.safeArea}>
        {/* Close button */}
        <Pressable
          onPress={() => router.back()}
          style={styles.closeButton}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M18 6L6 18M6 6l12 12"
              stroke={colors.creamMuted}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </Pressable>

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PRO</Text>
          </View>
          <Text style={styles.title}>Unlock Everything</Text>
          <Text style={styles.subtitle}>
            Get the full MyDriftLAB experience
          </Text>

          {/* Feature list */}
          <View style={styles.featureList}>
            {FEATURES.map((f) => (
              <View key={f.icon} style={styles.featureRow}>
                <View style={styles.featureIconWrap}>
                  <FeatureIcon icon={f.icon} />
                </View>
                <Text style={styles.featureText}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <Text style={styles.price}>{priceLabel}</Text>
          <Text style={styles.priceNote}>Cancel anytime</Text>

          {/* Error */}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* CTA */}
          <GlassButton
            title="Subscribe"
            onPress={purchase}
            size="large"
            loading={isLoading}
            disabled={!isReady || isLoading}
            style={styles.subscribeButton}
          />

          {/* Restore */}
          <Pressable
            onPress={restore}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>
        </View>
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
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(184,160,210,0.2)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.3)',
  },
  badgeText: {
    fontFamily: fonts.mono.medium,
    fontSize: 13,
    color: colors.lavender,
    letterSpacing: 2,
  },
  title: {
    fontFamily: fonts.headline.medium,
    fontSize: 32,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.body.light,
    fontSize: 16,
    color: colors.creamMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(184,160,210,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.cream,
    lineHeight: 20,
  },
  price: {
    fontFamily: fonts.headline.semiBold,
    fontSize: 28,
    color: colors.cream,
    marginBottom: 4,
  },
  priceNote: {
    fontFamily: fonts.body.light,
    fontSize: 13,
    color: colors.creamMuted,
    marginBottom: 24,
  },
  error: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.dustyRose,
    textAlign: 'center',
    marginBottom: 12,
  },
  subscribeButton: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  restoreText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.lavender,
    paddingVertical: 8,
  },
});
