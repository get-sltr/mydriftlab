import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function VerifyScreen() {
  const router = useRouter();
  const { confirmSignUp, resendCode, isLoading, error, clearError, pendingEmail } =
    useAuthStore();

  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  const handleVerify = async () => {
    if (!code.trim()) return;
    clearError();

    try {
      await confirmSignUp(code.trim());
      // Verification successful, go to sign in
      router.replace('/auth/sign-in');
    } catch {
      // Error handled by store
    }
  };

  const handleResend = async () => {
    await resendCode();
    setResent(true);
    setTimeout(() => setResent(false), 5000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.wordmarkBold}>Drift</Text>
            <Text style={styles.wordmarkItalic}>Lab</Text>
          </View>

          <GlowText style={styles.title}>Check your email</GlowText>
          <Text style={styles.subtitle}>
            We sent a verification code to{' '}
            <Text style={styles.emailHighlight}>
              {pendingEmail ?? 'your email'}
            </Text>
          </Text>

          {/* Code input */}
          <GlassInput
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />

          {error ? <Text style={styles.errorText} accessibilityRole="alert">{error}</Text> : null}

          <GlassButton
            title="Verify Email"
            onPress={handleVerify}
            size="large"
            loading={isLoading}
            disabled={code.trim().length < 6}
            style={styles.button}
          />

          {/* Resend */}
          <GlassButton
            title={resent ? 'Code sent!' : 'Resend Code'}
            onPress={handleResend}
            variant="ghost"
            size="small"
            disabled={resent}
            style={styles.resendButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.deep,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 40,
  },
  wordmarkBold: {
    fontFamily: fonts.wordmark.bold,
    fontSize: 28,
    color: colors.lavender,
  },
  wordmarkItalic: {
    fontFamily: fonts.wordmark.italic,
    fontSize: 28,
    color: colors.cream,
  },
  title: {
    marginBottom: 12,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.creamMuted,
    marginBottom: 36,
    lineHeight: 22,
  },
  emailHighlight: {
    color: colors.lavender,
    fontFamily: fonts.body.medium,
  },
  errorText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    color: colors.noise,
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 20,
    alignSelf: 'center',
  },
});
