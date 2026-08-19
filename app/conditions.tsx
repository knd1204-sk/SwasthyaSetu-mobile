import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../src/constants/theme';
import { Card, Badge, Skeleton, EmptyState, ErrorState } from '../src/components/Card';
import { patientApi, handleApiError } from '../src/services/api';
import { formatDate, getStatusBadgeVariant, capitalize } from '../src/utils/format';

export default function ConditionsScreen() {
  const { t, profile } = useAuth();
  const [conditions, setConditions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await patientApi.getChronicConditions();
      setConditions(res.data.data || []);
    } catch (e: any) {
      const handled = handleApiError(e);
      setError(handled.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch(true);
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('chronicConditions').replace('\n', ' ')}</Text>
        {profile?.full_name && (
          <Text style={styles.subtitle}>Patient: {profile.full_name}</Text>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={{ gap: spacing.md }}>
            {[0,1].map(i => (
              <Card key={i}>
                <Skeleton width="50%" height={20} />
                <Skeleton width="30%" height={14} style={{ marginTop: spacing.sm }} />
                <Skeleton width="100%" height={14} style={{ marginTop: spacing.md }} />
              </Card>
            ))}
          </View>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={() => fetch()} retryLabel={t('retry')} />
        )}

        {!loading && !error && conditions.length === 0 && (
          <EmptyState
            icon={<Ionicons name="heart-outline" size={30} color={colors.primary} />}
            title={t('noConditions')}
            description={t('noConditionsDesc')}
          />
        )}

        {!loading && !error && conditions.length > 0 && (
          <View style={{ gap: spacing.md }}>
            {conditions.map((item, idx) => (
              <Card key={item.id || idx}>
                <View style={styles.rowHeader}>
                  <View style={styles.conditionIcon}>
                    <Ionicons name="heart" size={20} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={styles.condName}>{item.condition_name}</Text>
                    <View style={styles.rowBadges}>
                      {item.status && (
                        <Badge
                          label={item.status === 'active' ? t('active') : item.status === 'managed' ? t('managed') : item.status === 'resolved' ? t('resolved') : capitalize(item.status)}
                          variant={getStatusBadgeVariant(item.status)}
                        />
                      )}
                      {item.diagnosed_date && (
                        <View style={styles.metaPill}>
                          <Text style={styles.metaPillText}>
                            {t('diagnosed')}: {formatDate(item.diagnosed_date, 'dateOnly')}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {item.notes && (
                  <View style={styles.notesBox}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textMuted} style={{ marginTop: 2 }} />
                    <Text style={styles.notesText}>{item.notes}</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  conditionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  condName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: spacing.sm,
  },
  rowBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaPill: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  metaPillText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  notesBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  notesText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});
