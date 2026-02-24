import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../lib/colors';

export default function Index() {
  const { isAuthenticated, isLoading, pendingEmail } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.lavender} />
      </View>
    );
  }

  if (pendingEmail) {
    return <Redirect href="/auth/verify" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/auth/sign-in" />;
  }

  return <Redirect href="/(tabs)/drift" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.deep,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
