import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import GradientBorderCard from '../../components/ui/GradientBorderCard';
import { useAuthStore } from '../../stores/authStore';
import {
  usePreferencesStore,
  fToC,
  cToF,
  formatTime,
  type MonitoringTheme,
} from '../../stores/preferencesStore';
import { useCBTIStore } from '../../stores/cbtiStore';
import * as AppleHealth from '../../services/health/appleHealth';
import { colors } from '../../lib/colors';
import { fonts } from '../../lib/typography';

type Sensitivity = 'low' | 'medium' | 'high';

/** Convert "HH:mm" to a Date (today) for the picker */
function hhmmToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** Extract "HH:mm" from a Date */
function dateToHhmm(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Thermostat bounds (°F internally)
const THERMO_MIN_F = 60;
const THERMO_MAX_F = 80;

const MONITORING_THEMES: { value: MonitoringTheme; label: string; icon: string }[] = [
  { value: 'fireflies', label: 'Fireflies', icon: '.' },
  { value: 'breathing', label: 'Breathing', icon: 'O' },
  { value: 'particles', label: 'Particles', icon: '*' },
  { value: 'nebula', label: 'Nebula', icon: '~' },
  { value: 'constellation', label: 'Stars', icon: '+' },
  { value: 'dandelion', label: 'Dandelion', icon: ',' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { email, name, tier, signOut } = useAuthStore();

  // Persistent preferences from store
  const {
    bedtimeGoal,
    wakeGoal,
    tempUnitF,
    partnerDefault,
    sensitivity,
    thermostatF,
    monitoringTheme,
    appleHealthEnabled,
    sonarEnabled,
    setBedtimeGoal,
    setWakeGoal,
    setTempUnitF,
    setPartnerDefault,
    setSensitivity,
    setThermostatF,
    setMonitoringTheme,
    setAppleHealthEnabled,
    setSonarEnabled,
  } = usePreferencesStore();

  const cbtiProgram = useCBTIStore((s) => s.program);
  const pauseCBTI = useCBTIStore((s) => s.pauseProgram);
  const resumeCBTI = useCBTIStore((s) => s.resumeProgram);

  // Time picker state
  const [pickerField, setPickerField] = useState<'bedtime' | 'wake' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());

  const openTimePicker = (field: 'bedtime' | 'wake') => {
    setPickerDate(hhmmToDate(field === 'bedtime' ? bedtimeGoal : wakeGoal));
    setPickerField(field);
  };

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setPickerField(null);
      if (selected) {
        const hhmm = dateToHhmm(selected);
        if (pickerField === 'bedtime') setBedtimeGoal(hhmm);
        else if (pickerField === 'wake') setWakeGoal(hhmm);
      }
    } else if (selected) {
      setPickerDate(selected);
    }
  };

  const confirmPicker = () => {
    const hhmm = dateToHhmm(pickerDate);
    if (pickerField === 'bedtime') setBedtimeGoal(hhmm);
    else if (pickerField === 'wake') setWakeGoal(hhmm);
    setPickerField(null);
  };

  // Use 12h format when imperial, 24h when metric
  const use12h = tempUnitF;

  // Thermostat display value
  const thermoDisplay = tempUnitF ? thermostatF : fToC(thermostatF);
  const thermoUnit = tempUnitF ? '°F' : '°C';

  // Step: 1°F when imperial, convert 1°C step to °F when metric
  const handleThermoUp = () => {
    if (tempUnitF) {
      if (thermostatF < THERMO_MAX_F) setThermostatF(thermostatF + 1);
    } else {
      const nextC = fToC(thermostatF) + 1;
      const nextF = cToF(nextC);
      if (nextF <= THERMO_MAX_F) setThermostatF(nextF);
    }
  };

  const handleThermoDown = () => {
    if (tempUnitF) {
      if (thermostatF > THERMO_MIN_F) setThermostatF(thermostatF - 1);
    } else {
      const nextC = fToC(thermostatF) - 1;
      const nextF = cToF(nextC);
      if (nextF >= THERMO_MIN_F) setThermostatF(nextF);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/auth/sign-in');
        },
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
          <Text style={styles.nameText}>{name ?? 'MyDriftLAB User'}</Text>
          <Text style={styles.emailText}>{email ?? ''}</Text>
          <View style={[styles.tierBadge, tier === 'pro' && styles.tierBadgePro]}>
            <Text style={[styles.tierText, tier === 'pro' && styles.tierTextPro]}>
              {tier === 'pro' ? 'PRO' : 'FREE'}
            </Text>
          </View>
          {tier === 'free' && (
            <GlassButton
              title="Upgrade to Pro"
              onPress={() => router.push('/upgrade')}
              size="medium"
              style={styles.upgradeButton}
            />
          )}
        </GradientBorderCard>

        {/* Sleep Schedule */}
        <Text style={styles.sectionTitle}>Sleep Schedule</Text>
        <View style={styles.row}>
          <PreferenceRow
            label="Bedtime Goal"
            value={formatTime(bedtimeGoal, use12h)}
            onPress={() => openTimePicker('bedtime')}
          />
          <PreferenceRow
            label="Wake Goal"
            value={formatTime(wakeGoal, use12h)}
            onPress={() => openTimePicker('wake')}
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
                accessibilityRole="button"
                accessibilityLabel="Fahrenheit"
                accessibilityState={{ selected: tempUnitF }}
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
                accessibilityRole="button"
                accessibilityLabel="Celsius"
                accessibilityState={{ selected: !tempUnitF }}
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
            <Text style={styles.prefLabel}>Thermostat Setting</Text>
            <View style={styles.stepperRow}>
              <Pressable
                onPress={handleThermoDown}
                accessibilityRole="button"
                accessibilityLabel="Decrease thermostat"
                style={styles.stepperButton}
              >
                <Text style={styles.stepperText}>−</Text>
              </Pressable>
              <Text style={styles.thermoValue}>
                {thermoDisplay}{thermoUnit}
              </Text>
              <Pressable
                onPress={handleThermoUp}
                accessibilityRole="button"
                accessibilityLabel="Increase thermostat"
                style={styles.stepperButton}
              >
                <Text style={styles.stepperText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Partner in Bed</Text>
            <Switch
              value={partnerDefault}
              onValueChange={setPartnerDefault}
              accessibilityLabel="Partner in bed"
              trackColor={{
                false: 'rgba(240,235,224,0.1)',
                true: 'rgba(184,160,210,0.4)',
              }}
              thumbColor={partnerDefault ? colors.lavender : colors.creamDim}
            />
          </View>
        </View>

        {/* Monitoring Theme */}
        <Text style={styles.sectionTitle}>Monitoring Theme</Text>
        <View style={styles.prefCard}>
          <Text style={styles.sensitivityDesc}>
            Choose the ambient visual displayed during overnight monitoring.
          </Text>
          <View style={styles.themeGrid}>
            {MONITORING_THEMES.map((t) => (
              <Pressable
                key={t.value}
                onPress={() => setMonitoringTheme(t.value)}
                accessibilityRole="button"
                accessibilityLabel={t.label}
                accessibilityState={{ selected: monitoringTheme === t.value }}
                style={[
                  styles.themeOption,
                  monitoringTheme === t.value && styles.themeOptionActive,
                ]}
              >
                <Text style={styles.themeEmoji}>{t.icon}</Text>
                <Text
                  style={[
                    styles.themeLabel,
                    monitoringTheme === t.value && styles.themeLabelActive,
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            ))}
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
                accessibilityRole="button"
                accessibilityLabel={`${level.charAt(0).toUpperCase() + level.slice(1)} sensitivity`}
                accessibilityState={{ selected: sensitivity === level }}
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

        {/* Sonar Tracking */}
        <Text style={styles.sectionTitle}>Sonar Tracking</Text>
        <View style={styles.prefCard}>
          <Text style={styles.sensitivityDesc}>
            Uses the phone's speaker + mic for contactless movement detection.
            Emits an inaudible 18.5kHz tone. Disable if you have pets that
            may be sensitive to ultrasonic frequencies.
          </Text>
          <View style={styles.prefRow}>
            <Text style={styles.prefLabel}>Sonar Enabled</Text>
            <Switch
              value={sonarEnabled}
              onValueChange={setSonarEnabled}
              accessibilityLabel="Sonar tracking"
              trackColor={{
                false: 'rgba(240,235,224,0.1)',
                true: 'rgba(184,160,210,0.4)',
              }}
              thumbColor={sonarEnabled ? colors.lavender : colors.creamDim}
            />
          </View>
        </View>

        {/* Apple Health (iOS only) */}
        {Platform.OS === 'ios' && (
          <>
            <Text style={styles.sectionTitle}>Apple Health</Text>
            <View style={styles.prefCard}>
              <Text style={styles.sensitivityDesc}>
                Reads sleep stages, HRV, respiratory rate, and SpO2 from Apple Health
                to enrich your reports. Writes sleep sessions back to Health.
              </Text>
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>Apple Health</Text>
                <Switch
                  value={appleHealthEnabled}
                  onValueChange={async (enabled) => {
                    if (enabled) {
                      const available = await AppleHealth.isAvailable();
                      if (!available) {
                        Alert.alert(
                          'Not Available',
                          'Apple Health is not available on this device.',
                        );
                        return;
                      }
                      const granted = await AppleHealth.requestPermissions();
                      if (!granted) {
                        Alert.alert(
                          'Permissions Required',
                          'Please grant Health permissions in Settings to use this feature.',
                        );
                        return;
                      }
                    }
                    setAppleHealthEnabled(enabled);
                  }}
                  accessibilityLabel="Apple Health integration"
                  trackColor={{
                    false: 'rgba(240,235,224,0.1)',
                    true: 'rgba(184,160,210,0.4)',
                  }}
                  thumbColor={appleHealthEnabled ? colors.lavender : colors.creamDim}
                />
              </View>
              {appleHealthEnabled && (
                <Text style={styles.healthStatus}>
                  Connected — sleep stages, HRV, SpO2, respiratory rate
                </Text>
              )}
            </View>
          </>
        )}

        {/* Insomnia Fighter */}
        {cbtiProgram && (cbtiProgram.status === 'active' || cbtiProgram.status === 'paused') && (
          <>
            <Text style={styles.sectionTitle}>Insomnia Fighter</Text>
            <View style={styles.prefCard}>
              <View style={styles.prefRow}>
                <Text style={styles.prefLabel}>
                  Week {cbtiProgram.currentWeek} of 6
                </Text>
                <Text style={[
                  styles.prefValue,
                  { color: cbtiProgram.status === 'paused' ? colors.dustyRose : colors.success },
                ]}>
                  {cbtiProgram.status === 'paused' ? 'Paused' : 'Active'}
                </Text>
              </View>
              <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
                <GlassButton
                  title={cbtiProgram.status === 'paused' ? 'Resume' : 'Pause Program'}
                  onPress={() => {
                    if (cbtiProgram.status === 'paused') {
                      resumeCBTI();
                    } else {
                      Alert.alert(
                        'Pause Program',
                        'You can resume at any time. Your progress will be saved.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Pause', onPress: pauseCBTI },
                        ],
                      );
                    }
                  }}
                  size="small"
                  variant="secondary"
                />
                <Pressable onPress={() => router.push('/cbti-info')}>
                  <Text style={styles.learnMoreLink}>About CBT-I</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}

        {/* Sign Out */}
        <GlassButton
          title="Sign Out"
          onPress={handleSignOut}
          variant="secondary"
          size="large"
          style={styles.signOutButton}
        />

        {/* Version */}
        <Text style={styles.version}>MyDriftLAB v1.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* iOS time picker modal */}
      {Platform.OS === 'ios' && pickerField !== null && (
        <Modal transparent animationType="slide">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerSheet}>
              <View style={styles.pickerHeader}>
                <Pressable onPress={() => setPickerField(null)}>
                  <Text style={styles.pickerCancel}>Cancel</Text>
                </Pressable>
                <Text style={styles.pickerTitle}>
                  {pickerField === 'bedtime' ? 'Bedtime Goal' : 'Wake Goal'}
                </Text>
                <Pressable onPress={confirmPicker}>
                  <Text style={styles.pickerDone}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={pickerDate}
                mode="time"
                display="spinner"
                is24Hour={!use12h}
                onChange={onPickerChange}
                textColor={colors.cream}
                themeVariant="dark"
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Android time picker (renders inline, auto-dismisses) */}
      {Platform.OS === 'android' && pickerField !== null && (
        <DateTimePicker
          value={pickerDate}
          mode="time"
          display="default"
          is24Hour={!use12h}
          onChange={onPickerChange}
        />
      )}
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
    <Pressable onPress={onPress} style={styles.timeCard} accessibilityRole="button" accessibilityLabel={`${label}, ${value}`} accessibilityHint="Double tap to change">
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
  tierBadgePro: {
    backgroundColor: 'rgba(184,160,210,0.25)',
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.3)',
  },
  tierTextPro: {
    color: colors.lavenderLight,
  },
  upgradeButton: {
    marginTop: 14,
    alignSelf: 'stretch',
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
  // Thermostat stepper
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(240,235,224,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperText: {
    fontFamily: fonts.mono.medium,
    fontSize: 18,
    color: colors.lavender,
  },
  thermoValue: {
    fontFamily: fonts.mono.medium,
    fontSize: 16,
    color: colors.cream,
    minWidth: 48,
    textAlign: 'center',
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
  // Monitoring theme picker
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  themeOption: {
    width: '31%' as any,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(240,235,224,0.05)',
    alignItems: 'center',
  },
  themeOptionActive: {
    backgroundColor: 'rgba(184,160,210,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.3)',
  },
  themeEmoji: {
    fontFamily: fonts.mono.regular,
    fontSize: 18,
    color: colors.creamDim,
    marginBottom: 4,
  },
  themeLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 11,
    color: colors.creamDim,
  },
  themeLabelActive: {
    color: colors.lavender,
    fontFamily: fonts.body.semiBold,
  },
  healthStatus: {
    fontFamily: fonts.mono.regular,
    fontSize: 11,
    color: colors.success,
    paddingVertical: 8,
  },
  learnMoreLink: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    color: colors.lavender,
    textDecorationLine: 'underline',
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
  // Time picker modal (iOS)
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerSheet: {
    backgroundColor: colors.navy,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(240,235,224,0.08)',
  },
  pickerCancel: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.creamMuted,
  },
  pickerTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.cream,
  },
  pickerDone: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.lavender,
  },
});
