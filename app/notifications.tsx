import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius } from '../src/constants/theme';
import { Skeleton, EmptyState, ErrorState } from '../src/components/Card';
import { notificationsApi, handleApiError } from '../src/services/api';
import { formatRelativeTime } from '../src/utils/format';

interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

const iconForType = (type: string): { name: keyof typeof Ionicons.glyphMap; bg: string; color: string } => {
  const t = (type || '').toLowerCase();
  if (t.includes('report')) return { name: 'file-tray-full', bg: '#E3F2FD', color: colors.signalBlue };
  if (t.includes('drug') || t.includes('alert') || t.includes('interaction')) return { name: 'warning', bg: '#FFF3E0', color: colors.honeyGold };
  if (t.includes('consult')) return { name: 'calendar', bg: colors.primaryLight, color: colors.primary };
  if (t.includes('presc')) return { name: 'medkit', bg: '#F3E5F5', color: '#7B1FA2' };
  return { name: 'notifications', bg: colors.primaryLight, color: colors.primary };
};

export default function NotificationsScreen() {
  const { t } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await notificationsApi.getAll();
      const list = (res.data.data || []) as Notification[];
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setItems(list);
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

  const handleTap = async (item: Notification) => {
    if (item.is_read) return;
    try {
      await notificationsApi.markRead(item.id);
      setItems((prev) => prev.map((n) => n.id === item.id ? { ...n, is_read: true } : n));
    } catch {
      // ignore
    }
  };

  const unreadCount = items.filter((i) => !i.is_read).length;

  const renderItem = ({ item, index }: { item: Notification; index: number }) => {
    const icon = iconForType(item.type);
    return (
      <Pressable
        onPress={() => handleTap(item)}
        style={({ pressed }) => [
          styles.notifRow,
          !item.is_read ? styles.notifUnread : null,
          { opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <View style={[styles.notifIcon, { backgroundColor: icon.bg }]}>
          <Ionicons name={icon.name} size={20} color={icon.color} />
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={[styles.notifTitle, !item.is_read ? styles.notifTitleBold : null]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.notifMessage} numberOfLines={3}>
            {item.message}
          </Text>
          <Text style={styles.notifTime}>{formatRelativeTime(item.created_at)}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </Pressable>
    );
  };

  const ItemSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('notifications')}</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadSubtitle}>
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </Text>
          )}
        </View>
      </View>

      {loading && (
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md }}>
          {[0,1,2,3].map(i => (
            <View key={i} style={{ flexDirection: 'row', gap: spacing.md }}>
              <Skeleton width={44} height={44} style={{ borderRadius: 22 }} />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Skeleton width="70%" height={16} />
                <Skeleton width="100%" height={14} />
                <Skeleton width="30%" height={12} />
              </View>
            </View>
          ))}
        </View>
      )}

      {error && !loading && (
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ErrorState message={error} onRetry={() => fetch()} retryLabel={t('retry')} />
        </View>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={<Ionicons name="notifications-off-outline" size={30} color={colors.primary} />}
          title={t('noNotifications')}
          description={t('noNotificationsDesc')}
        />
      )}

      {!loading && !error && items.length > 0 && (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, paddingTop: spacing.sm }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  unreadSubtitle: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  notifUnread: {
    backgroundColor: colors.primaryLight + '80',
  },
  notifIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  notifTitleBold: { fontWeight: '700' },
  notifMessage: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    marginTop: spacing.sm,
    marginLeft: spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 44 + spacing.md + spacing.sm,
  },
});
