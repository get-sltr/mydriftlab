/**
 * Recording Consent Screen
 *
 * Full-screen, one-time consent required before any audio recording.
 * Shown during onboarding or the first time a user tries to record.
 * Clearly explains:
 *  - What is recorded (ambient audio for event detection)
 *  - Audio clips auto-delete after 10 days
 *  - MyDriftLAB does not retain any copies
 *  - User may download/export clips within the 10-day window
 *  - After 10 days, clips are permanently deleted
 */

import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { usePreferencesStore } from '../stores/preferencesStore';
import GlassButton from '../components/ui/GlassButton';
import { colors } from '../lib/colors';
import { fonts, textStyles } from '../lib/typography';

export default function RecordingConsentScreen() {
  const router = useRouter();
  const setRecordingConsent = usePreferencesStore((s) => s.setRecordingConsent);

  const handleAccept = async () => {
    await setRecordingConsent(true);
    router.back();
  };

  const handleDecline = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"
              stroke={colors.lavender}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8"
              stroke={colors.lavender}
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text style={styles.title}>Audio Recording Consent</Text>

        <Text style={styles.subtitle}>
          MyDriftLAB uses your device microphone to monitor your sleep environment overnight.
        </Text>

        {/* Key points */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What We Record</Text>
          <Text style={styles.body}>
            During a monitoring session, MyDriftLAB records ambient audio through your device
            microphone to detect sleep-disrupting events like snoring, noise disturbances, and
            environmental changes. Short audio clips (up to 5 minutes each) are saved only
            when an event is detected.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Privacy</Text>
          <BulletPoint text="All audio is processed and stored entirely on your device." />
          <BulletPoint text="Audio clips are automatically and permanently deleted after 10 days." />
          <BulletPoint text="MyDriftLAB does not upload, transmit, copy, or retain any audio recordings on our servers." />
          <BulletPoint text="We have no access to your audio clips at any time." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Control</Text>
          <BulletPoint text="You may listen to and export your audio clips at any time within the 10-day window." />
          <BulletPoint text="If you wish to keep a clip beyond 10 days, you must download or share it before it expires." />
          <BulletPoint text="Once the 10-day window passes, the audio clip is permanently deleted from your device and cannot be recovered — by you or by us." />
          <BulletPoint text="You can revoke this consent at any time in Profile settings. Revoking consent will disable audio clip capture but will not affect event detection." />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens Without Consent</Text>
          <Text style={styles.body}>
            If you decline, MyDriftLAB will still detect sleep events using audio metering
            (volume levels only), but no audio clips will be saved. You will not be able
            to listen back to events in your morning report.
          </Text>
        </View>

        <View style={styles.legalNote}>
          <Text style={styles.legalText}>
            By tapping "I Agree" below, you consent to MyDriftLAB recording ambient audio
            during your sleep monitoring sessions under the terms described above. This
            consent applies to all future sessions until you revoke it in your Profile settings.
          </Text>
        </View>

        {/* Actions */}
        <GlassButton
          title="I Agree"
          onPress={handleAccept}
          size="large"
          style={styles.acceptButton}
        />

        <Pressable onPress={handleDecline} style={styles.declineButton}>
          <Text style={styles.declineText}>Not Now</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
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
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(184,160,210,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(184,160,210,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: fonts.headline.medium,
    fontSize: 24,
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.creamMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: fonts.body.semiBold,
    fontSize: 16,
    color: colors.cream,
    marginBottom: 10,
  },
  body: {
    ...textStyles.body,
    color: colors.creamMuted,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingRight: 8,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.lavender,
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  bulletText: {
    ...textStyles.body,
    color: colors.creamMuted,
    lineHeight: 22,
    flex: 1,
  },
  legalNote: {
    backgroundColor: 'rgba(240,235,224,0.03)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(240,235,224,0.06)',
    marginBottom: 24,
  },
  legalText: {
    fontFamily: fonts.body.light,
    fontSize: 13,
    color: colors.creamDim,
    lineHeight: 20,
  },
  acceptButton: {
    marginBottom: 12,
  },
  declineButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  declineText: {
    fontFamily: fonts.body.regular,
    fontSize: 16,
    color: colors.creamMuted,
  },
});
