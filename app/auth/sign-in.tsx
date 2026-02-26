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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, isLoading, error, clearError, pendingEmail } =
    useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email.trim() || !password) return;
    clearError();

    try {
      await signIn(email.trim().toLowerCase(), password);
      router.replace('/(tabs)/drift');
    } catch (err: any) {
      if (err?.code === 'UserNotConfirmedException') {
        router.replace('/auth/verify');
      }
    }
  };

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
          {/* Logo area */}
          <View style={styles.header}>
            <Text style={styles.wordmarkBold}>Drift</Text>
            <Text style={styles.wordmarkItalic}>Lab</Text>
          </View>
          <GlowText style={styles.title}>Welcome back</GlowText>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Text style={styles.showHide}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              }
            />

            {error ? <Text style={styles.errorText} accessibilityRole="alert">{error}</Text> : null}

            <GlassButton
              title="Sign In"
              onPress={handleSignIn}
              size="large"
              loading={isLoading}
              disabled={!email.trim() || !password}
              style={styles.button}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/auth/sign-up')} accessibilityRole="link" accessibilityLabel="Create an account">
              <Text style={styles.footerLink}> Create one</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
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
    marginBottom: 8,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.creamMuted,
    marginBottom: 40,
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
  showHide: {
    fontFamily: fonts.body.medium,
    fontSize: 12,
    color: colors.lavender,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
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
