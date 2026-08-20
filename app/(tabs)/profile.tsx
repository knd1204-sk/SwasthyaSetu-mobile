import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { Card, Skeleton } from '../../src/components/Card';
import { Language } from '../../src/constants/translations';
import { formatDate, formatGender } from '../../src/utils/format';

export default function ProfileScreen() {
  const { profile, t, language, setLanguage, logout, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(!profile);
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!profile) {
        await refreshProfile();
      }
      setLoading(false);
    };
    init();
  }, [profile, refreshProfile]);

  const handleLogout = async () => {
    setLogoutConfirmVisible(false);
    await logout();
    router.replace('/login');
  };

  const infoRows = [
    {
      label: t('dateOfBirth'),
      value: profile?.date_of_birth ? formatDate(profile.date_of_birth, 'dateOnly') : null,
      icon: 'calendar-outline' as const,
      iconColor: colors.honeyGold,
      iconBg: '#FFF8E1',
    },
    {
      label: t('gender'),
      value: profile?.gender ? formatGender(profile.gender) : null,
      icon: 'person-outline' as const,
      iconColor: colors.signalBlue,
      iconBg: '#E3F2FD',
    },
    {
      label: t('bloodGroup'),
      value: profile?.blood_group,
      icon: 'water-outline' as const,
      iconColor: colors.accent,
      iconBg: '#FFEBEE',
    },
    {
      label: t('address'),
      value: profile?.address,
      icon: 'location-outline' as const,
      iconColor: colors.primary,
      iconBg: colors.primaryLight,
      multiline: true,
    },
    {
      label: t('emergencyContact'),
      value: profile?.emergency_contact,
      icon: 'call-outline' as const,
      iconColor: '#7B1FA2',
      iconBg: '#F3E5F5',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('profileTitle')}</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.full_name?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: spacing.md, minHeight: 60, justifyContent: 'center' }}>
            {loading ? (
              <>
                <Skeleton width="70%" height={22} />
                <Skeleton width="50%" height={14} style={{ marginTop: spacing.sm }} />
              </>
            ) : (
              <>
                <Text style={styles.name} numberOfLines={1}>
                  {profile?.full_name || 'Patient'}
                </Text>
                {profile?.health_id && (
                  <Text style={styles.healthId} numberOfLines={1}>
                    {t('healthId')}: {profile.health_id}
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <Card style={{ marginTop: spacing.xxl, marginBottom: spacing.xl }}>
          <Text style={styles.sectionTitle}>{t('personalInfo')}</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            {infoRows.map((row) => (
              <View key={row.label} style={styles.infoRow}>
                <View style={[styles.infoIcon, { backgroundColor: row.iconBg }]}>
                  <Ionicons name={row.icon} size={20} color={row.iconColor} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  {loading ? (
                    <Skeleton width="60%" height={16} style={{ marginTop: 4 }} />
                  ) : (
                    <Text
                      style={[
                        styles.infoValue,
                        row.multiline ? { lineHeight: 20 } : null,
                      ]}
                      numberOfLines={row.multiline ? 0 : 1}
                    >
                      {row.value || '—'}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Card style={{ marginBottom: spacing.xl }}>
          <Text style={styles.sectionTitle}>{t('settings')}</Text>
          <View style={{ marginTop: spacing.md }}>
            <Pressable
              onPress={() => setLangModalVisible(true)}
              style={({ pressed }) => [
                styles.settingsRow,
                { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] },
              ]}
            >
              <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="language" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.settingsLabel}>{t('language')}</Text>
                <Text style={styles.settingsValue}>
                  {language === 'en' ? t('english') : t('hindi')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable
              onPress={() => router.push('/notifications')}
              style={({ pressed }) => [
                styles.settingsRow,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <View style={[styles.infoIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="notifications-outline" size={20} color={colors.signalBlue} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <Text style={styles.settingsLabel}>{t('notifications')}</Text>
                <Text style={styles.settingsValue}>View all alerts</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </Card>

        <Pressable
          onPress={() => setLogoutConfirmVisible(true)}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
          ]}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.accent} />
          <Text style={styles.logoutText}>{t('logout')}</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLangModalVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('language')}</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {(['en', 'hi'] as Language[]).map((lang) => {
                const isSelected = language === lang;
                const label = lang === 'en' ? t('english') : t('hindi');
                return (
                  <Pressable
                    key={lang}
                    onPress={() => {
                      setLanguage(lang);
                      setLangModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.langOption,
                      isSelected ? styles.langOptionSelected : null,
                      { opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Text style={[styles.langOptionText, isSelected ? styles.langOptionTextSelected : null]}>
                      {label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={() => setLangModalVisible(false)}
              style={({ pressed }) => [
                styles.modalClose,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.modalCloseText}>{t('cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={logoutConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutConfirmVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLogoutConfirmVisible(false)}
        >
          <Pressable style={styles.modalBox} onPress={(e) => e.stopPropagation()}>
            <View style={styles.warnIcon}>
              <Ionicons name="log-out-outline" size={28} color={colors.accent} />
            </View>
            <Text style={styles.modalTitle}>{t('logout')}</Text>
            <Text style={styles.modalMessage}>{t('logoutConfirm')}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl }}>
              <Pressable
                onPress={() => setLogoutConfirmVisible(false)}
                style={({ pressed }) => [
                  styles.btnSecondary,
                  { flex: 1, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text style={styles.btnSecondaryText}>{t('cancel')}</Text>
              </Pressable>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [
                  styles.btnDanger,
                  { flex: 1, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Text style={styles.btnDangerText}>{t('confirm')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  healthId: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingsLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  settingsValue: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 36 + spacing.md,
    marginVertical: spacing.xs,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    paddingVertical: spacing.lg - 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.accent + '55',
    ...shadows.card,
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 43, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.elevated,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  modalMessage: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  warnIcon: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  langOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  langOptionText: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  langOptionTextSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  modalClose: {
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  modalCloseText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textMuted,
  },
  btnSecondary: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnSecondaryText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  btnDanger: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  btnDangerText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
});
