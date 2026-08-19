import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { Card, Badge, Skeleton } from '../../src/components/Card';
import { getGreeting, capitalize } from '../../src/utils/format';

export default function HomeScreen() {
  const { profile, t, refreshProfile, isVerifying } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(!profile);

  useEffect(() => {
    const init = async () => {
      if (!profile) {
        await refreshProfile();
      }
      setLoading(false);
    };
    init();
  }, [profile, refreshProfile]);

  const greetingKey = getGreeting();
  const patientName = profile?.full_name || '';
  const healthId = profile?.health_id || '';
  const displayName = patientName
    ? patientName.split(' ').map(capitalize).join(' ')
    : 'Patient';

  const quickActions = [
    {
      id: 'scan',
      label: t('scanPrescription'),
      icon: 'scan' as const,
      bgColor: colors.primaryLight,
      iconColor: colors.primary,
      onPress: () => router.push('/(tabs)/scan'),
    },
    {
      id: 'records',
      label: t('myRecords'),
      icon: 'folder-open' as const,
      bgColor: '#E3F2FD',
      iconColor: colors.signalBlue,
      onPress: () => router.push('/(tabs)/records'),
    },
    {
      id: 'conditions',
      label: t('chronicConditions'),
      icon: 'heart' as const,
      bgColor: '#FFF3E0',
      iconColor: colors.honeyGold,
      onPress: () => router.push('/conditions'),
    },
    {
      id: 'chat',
      label: t('aiChat'),
      icon: 'chatbubbles' as const,
      bgColor: '#F3E5F5',
      iconColor: '#7B1FA2',
      onPress: () => router.push('/(tabs)/chat'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t(greetingKey as any)}</Text>
            {loading ? (
              <View style={{ marginTop: 2 }}>
                <Skeleton width={180} height={28} />
              </View>
            ) : (
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            )}
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={({ pressed }) => [
              styles.notifButton,
              { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.idCardOuter}>
          <Card padding={0} style={styles.idCard} elevation="elevated">
            <View style={styles.idCardHeader}>
              <View style={styles.idBrand}>
                <View style={styles.idLogo}>
                  <Text style={styles.idLogoText}>⚕</Text>
                </View>
                <View>
                  <Text style={styles.idBrandText}>SwasthyaSetu</Text>
                  <Text style={styles.idBrandSub}>National Health ID</Text>
                </View>
              </View>
            </View>

            <View style={styles.idCardBody}>
              <View style={styles.idInfoSection}>
                <Text style={styles.idNameLabel}>Patient Name</Text>
                {loading ? (
                  <Skeleton width={200} height={24} style={{ marginTop: 4 }} />
                ) : (
                  <Text style={styles.idName}>{displayName}</Text>
                )}
              </View>

              <View style={styles.idQrRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.idHidLabel}>{t('healthId')}</Text>
                  {loading ? (
                    <Skeleton width={160} height={20} style={{ marginTop: 4 }} />
                  ) : (
                    <Text style={styles.idHid} numberOfLines={1}>{healthId || '—'}</Text>
                  )}
                  {profile?.blood_group ? (
                    <View style={{ marginTop: spacing.md }}>
                      <Text style={styles.idHidLabel}>Blood Group</Text>
                      <Text style={styles.idBlood}>{profile.blood_group}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.qrWrapper}>
                  {loading || !healthId ? (
                    <View style={[styles.qrBox, { justifyContent: 'center', alignItems: 'center' }]}>
                      <Skeleton width={90} height={90} />
                    </View>
                  ) : (
                    <View style={styles.qrBox}>
                      <QRCode
                        value={healthId}
                        size={90}
                        color={colors.text}
                        backgroundColor={colors.white}
                      />
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.idCardFooter}>
              <Text style={styles.idFooterText}>Present this QR at any registered healthcare facility</Text>
            </View>
          </Card>
        </View>

        <View style={styles.quickActionsHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.id}
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.actionTile,
                {
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <View
                style={[
                  styles.actionIconBg,
                  { backgroundColor: action.bgColor },
                ]}
              >
                <Ionicons name={action.icon} size={26} color={action.iconColor} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="shield-checkmark" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Data stays with you</Text>
            <Text style={styles.tipText}>
              Your health records are encrypted and accessible only by you and your care team.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    paddingTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    fontWeight: '500',
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginTop: 2,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  idCardOuter: {
    marginBottom: spacing.xxl,
  },
  idCard: {
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(15, 110, 92, 0.12)',
  },
  idCardHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  idBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  idLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  idLogoText: {
    fontSize: 20,
    color: colors.white,
  },
  idBrandText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -0.2,
  },
  idBrandSub: {
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  idCardBody: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  idInfoSection: {
    marginBottom: spacing.md,
  },
  idNameLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
    letterSpacing: -0.2,
  },
  idQrRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  idHidLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  idHid: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 3,
    fontFamily: 'System',
  },
  idBlood: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 3,
  },
  qrWrapper: {
    alignItems: 'center',
  },
  qrBox: {
    width: 110,
    height: 110,
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    marginTop: spacing.md,
  },
  idFooterText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  quickActionsHeader: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.sm / 2,
    marginBottom: spacing.xxl,
  },
  actionTile: {
    width: '50%',
    padding: spacing.sm / 2,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 18,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.primaryLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    opacity: 0.85,
  },
});
