import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../src/constants/theme';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';

export default function LoginScreen() {
  const { login, isLoading, error, t, isColdStarting, language, setLanguage, isAuthenticated } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error && !isColdStarting) {
      Alert.alert('Login Failed', error);
    }
  }, [error, isColdStarting]);

  const validate = (): boolean => {
    let valid = true;
    if (!identifier.trim()) {
      setIdentifierError('Email or phone is required');
      valid = false;
    } else {
      setIdentifierError(undefined);
    }
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (password.length < 4) {
      setPasswordError('Password is too short');
      valid = false;
    } else {
      setPasswordError(undefined);
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    await login(identifier.trim(), password);
  };

  const displayMessage = isColdStarting ? t('coldStart') : error || '';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.langBar}>
            <Pressable
              onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              style={({ pressed }) => [
                styles.langToggle,
                { opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="language" size={16} color={colors.primary} />
              <Text style={styles.langText}>
                {language === 'en' ? 'हिंदी' : 'English'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoEmoji}>⚕</Text>
            </View>
            <Text style={styles.title}>{t('appName')}</Text>
            <Text style={styles.subtitle}>{t('welcomeSubtitle')}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.welcome}>{t('welcomeBack')}</Text>

            {displayMessage ? (
              <View style={styles.messageBox}>
                <Ionicons
                  name={isColdStarting ? 'cloud-outline' : 'alert-circle-outline'}
                  size={18}
                  color={isColdStarting ? colors.signalBlue : colors.accent}
                />
                <Text style={[styles.messageText, isColdStarting ? { color: colors.signalBlue } : null]}>
                  {displayMessage}
                </Text>
              </View>
            ) : null}

            <Input
              label={t('emailOrPhone')}
              value={identifier}
              onChangeText={(v) => {
                setIdentifier(v);
                if (identifierError) setIdentifierError(undefined);
              }}
              placeholder="you@example.com or +91..."
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={Platform.OS === 'ios' ? 'email-address' : 'visible-password'}
              returnKeyType="next"
              error={identifierError}
              leftIcon={
                <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              }
            />

            <Input
              label={t('password')}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (passwordError) setPasswordError(undefined);
              }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              error={passwordError}
              leftIcon={
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} />
              }
              rightIcon={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={10}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
              onSubmitEditing={handleLogin}
            />

            <Button
              title={isLoading && isColdStarting ? t('coldStart') : t('loginButton')}
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Patient accounts are created by your healthcare provider.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    justifyContent: 'space-between',
  },
  langBar: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  langToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  langText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logoEmoji: {
    fontSize: 42,
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
  form: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  welcome: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  messageText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.accent,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: spacing.lg,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
