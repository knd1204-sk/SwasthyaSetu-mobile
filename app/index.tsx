import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { colors, fontSize, spacing } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, isLoading, isVerifying, t } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading || isVerifying) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const isLoginPage = segments[0] === 'login' || segments[0] === undefined;

    if (isAuthenticated && !inAuthGroup) {
      router.replace('/(tabs)/home');
    } else if (!isAuthenticated && inAuthGroup) {
      router.replace('/login');
    } else if (!isAuthenticated && !isLoginPage) {
      router.replace('/login');
    } else if (!isAuthenticated && segments.length === 1 && segments[0] === 'index') {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isVerifying, segments, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoIcon}>⚕</Text>
        </View>
        <Text style={styles.appName}>SwasthyaSetu</Text>
        <Text style={styles.tagline}>Your Health, Unified</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xxxl }} />
      <Text style={styles.loadingText}>
        {(isLoading || isVerifying) ? t('loading') : t('connecting')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 52,
    color: colors.primary,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
