import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import GradientBorderCard from '../../components/ui/GradientBorderCard';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

type Sensitivity = 'low' | 'medium' | 'high';

export default function ProfileScreen() {
  const { email, name, signOut } = useAuthStore();

  // Local preference state (will sync with API in future)
  const [bedtimeGoal, setBedtimeGoal] = useState('10:30 PM');
  const [wakeGoal, setWakeGoal] = useState('6:30 AM');
  const [tempUnitF, setTempUnitF] = useState(true);
  const [partnerDefault, setPartnerDefault] = useState(false);
  const [sensitivity, setSensitivity] = useState<Sensitivity>('medium');
  const [thermostat, setThermostat] = useState('68');

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GlowText style={styles.title}>Profile</GlowText>

        {/* Account info */}
        <GradientBorderCard style={styles.card}>
          <Text style={styles.cardLabel}>Account</Text>
          <Text style={styles.nameText}>{name ?? 'DriftLab User'}</Text>
          <Text style={styles.emailText}>{email ?? ''}</Text>
          <View style={styles.tierBadge}>
            <Text style={styles.tierText}>FREE</Text>
          </View>
        </GradientBorderCard>

        {/* Sleep Schedule */}
        <Text style={styles.sectionTitle}>Sleep Schedule</Text>
        <View style={styles.row}>
          <PreferenceRow
            label="Bedtime Goal"
            value={bedtimeGoal}
            onPress={() => {
              // TODO: time picker
            }}
          />
          <PreferenceRow
            label="Wake Goal"
            value={wakeGoal}
            onPress={() => {
              // TODO: time picker
            }}
          />
        </View>

        {/* Environment */}
        <Text style={styles.sectionTitle}>Environment</Text>
        <View style={styles.prefCard}>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Temperature Unit</Text>
            <View style={styles.segmentRow}>
              <Pressable
                onPress={() => setTempUnitF(true)}
                style={[
                  styles.segment,
                  tempUnitF && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    tempUnitF && styles.segmentTextActive,
                  ]}
                >
                  °F
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTempUnitF(false)}
                style={[
                  styles.segment,
                  !tempUnitF && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    !tempUnitF && styles.segmentTextActive,
                  ]}
                >
                  °C
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>
              Thermostat Setting
            </Text>
            <Text style={styles.prefValue}>
              {thermostat}°{tempUnitF ? 'F' : 'C'}
            </Text>
          </View>

          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Partner in Bed</Text>
            <Switch
              value={partnerDefault}
              onValueChange={setPartnerDefault}
              trackColor={{
                false: 'rgba(240,235,224,0.1)',
                true: 'rgba(184,160,210,0.4)',
              }}
              thumbColor={partnerDefault ? colors.lavender : colors.creamDim}
            />
          </View>
        </View>

        {/* Sensitivity */}
        <Text style={styles.sectionTitle}>Detection Sensitivity</Text>
        <View style={styles.prefCard}>
          <Text style={styles.sensitivityDesc}>
            Controls how easily noise and movement events are triggered.
          </Text>
          <View style={styles.sensitivityRow}>
            {(['low', 'medium', 'high'] as Sensitivity[]).map((level) => (
              <Pressable
                key={level}
                onPress={() => setSensitivity(level)}
                style={[
                  styles.sensitivityOption,
                  sensitivity === level && styles.sensitivityActive,
                ]}
              >
                <Text
                  style={[
                    styles.sensitivityText,
                    sensitivity === level && styles.sensitivityTextActive,
                  ]}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <GlassButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          size="large"
          style={styles.signOutButton}
        />

        {/* Version */}
        <Text style={styles.version}>DriftLab v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.timeCard}>
      <Text style={styles.timeLabel}>{label}</Text>
      <Text style={styles.timeValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  title: {
    marginBottom: 24,
  },
  card: {
    marginBottom: 28,
  },
  cardLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.creamMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  nameText: {
    fontFamily: fonts.body.semiBold,
    fontSize: 20,
    color: colors.cream,
    marginBottom: 4,
  },
  emailText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamMuted,
    marginBottom: 12,
  },
  tierBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(184,160,210,0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tierText: {
    fontFamily: fonts.mono.medium,
    fontSize: 10,
    color: colors.lavender,
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontFamily: fonts.headline.medium,
    fontSize: 18,
    color: colors.cream,
    marginBottom: 12,
    textShadowColor: 'rgba(184,160,210,0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  timeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
  },
  timeLabel: {
    fontFamily: fonts.body.medium,
    fontSize: 11,
    color: colors.creamMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  timeValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 20,
    color: colors.cream,
  },
  prefCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240,235,224,0.05)',
  },
  prefLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 15,
    color: colors.cream,
  },
  prefValue: {
    fontFamily: fonts.mono.regular,
    fontSize: 15,
    color: colors.creamMuted,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(240,235,224,0.05)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  segmentActive: {
    backgroundColor: 'rgba(184,160,210,0.2)',
  },
  segmentText: {
    fontFamily: fonts.mono.regular,
    fontSize: 14,
    color: colors.creamDim,
  },
  segmentTextActive: {
    color: colors.lavender,
    fontFamily: fonts.mono.medium,
  },
  sensitivityDesc: {
    fontFamily: fonts.body.light,
    fontSize: 13,
    color: colors.creamMuted,
    marginBottom: 16,
    lineHeight: 18,
  },
  sensitivityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sensitivityOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(240,235,224,0.05)',
    alignItems: 'center',
  },
  sensitivityActive: {
    backgroundColor: 'rgba(184,160,210,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.3)',
  },
  sensitivityText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.creamDim,
  },
  sensitivityTextActive: {
    color: colors.lavender,
    fontFamily: fonts.body.semiBold,
  },
  signOutButton: {
    marginTop: 8,
  },
  version: {
    fontFamily: fonts.mono.light,
    fontSize: 11,
    color: colors.creamDim,
    textAlign: 'center',
    marginTop: 24,
  },
});
