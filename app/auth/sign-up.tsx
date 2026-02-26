import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import GlowText from '../../components/ui/GlowText';
import GlassButton from '../../components/ui/GlassButton';
import GlassInput from '../../components/ui/GlassInput';
import { useAuthStore } from '../../stores/authStore';
import { colors } from '../../lib/colors';
import { fonts, textStyles } from '../../lib/typography';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSignUp = async () => {
    clearError();
    setLocalError('');

    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    try {
      await signUp(email.trim().toLowerCase(), password, name.trim());
      router.replace('/auth/verify');
    } catch {
      // Error handled by store
    }
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.wordmarkBold}>Drift</Text>
            <Text style={styles.wordmarkItalic}>Lab</Text>
          </View>
          <GlowText style={styles.title}>Create account</GlowText>
          <Text style={styles.subtitle}>
            Turn your bedroom into a sleep lab
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <GlassInput
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
            />

            <GlassInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
            />

            <GlassInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Min 8 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="next"
            />

            <GlassInput
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSignUp}
            />

            {displayError ? (
              <Text style={styles.errorText} accessibilityRole="alert">{displayError}</Text>
            ) : null}

            <GlassButton
              title="Create Account"
              onPress={handleSignUp}
              size="large"
              loading={isLoading}
              disabled={
                !name.trim() ||
                !email.trim() ||
                !password ||
                !confirmPassword
              }
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable onPress={() => router.back()} accessibilityRole="link" accessibilityLabel="Sign in to existing account">
              <Text style={styles.footerLink}> Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
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
    marginBottom: 8,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.creamMuted,
    marginBottom: 32,
  },
  form: {
    flex: 1,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    ...textStyles.caption,
    color: colors.creamMuted,
  },
  footerLink: {
    ...textStyles.caption,
    color: colors.lavender,
    fontFamily: fonts.body.semiBold,
  },
});
