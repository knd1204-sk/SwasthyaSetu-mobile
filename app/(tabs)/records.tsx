import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { Card, Badge, Skeleton, EmptyState, ErrorState } from '../../src/components/Card';
import { patientApi, handleApiError } from '../../src/services/api';
import { formatDate, formatRelativeTime, getStatusBadgeVariant, capitalize } from '../../src/utils/format';

type RecordsTab = 'consultations' | 'prescriptions' | 'labOrders' | 'labReports';

export default function RecordsScreen() {
  const { t } = useAuth();
  const [activeTab, setActiveTab] = useState<RecordsTab>('consultations');
  const [refreshing, setRefreshing] = useState(false);

  const [consultations, setConsultations] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [labOrders, setLabOrders] = useState<any[]>([]);
  const [labReports, setLabReports] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coldStart, setColdStart] = useState(false);

  const tabs: { key: RecordsTab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'consultations', label: t('consultations'), icon: 'document-text-outline' },
    { key: 'prescriptions', label: t('prescriptions'), icon: 'medkit-outline' },
    { key: 'labOrders', label: t('labOrders'), icon: 'receipt-outline' },
    { key: 'labReports', label: t('labReports'), icon: 'file-tray-full-outline' },
  ];

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    setError(null);
    setColdStart(false);
    const startTime = Date.now();

    try {
      const [cRes, pRes, loRes, lrRes] = await Promise.all([
        patientApi.getConsultations(),
        patientApi.getPrescriptions(),
        patientApi.getLabOrders(),
        patientApi.getLabReports(),
      ]);

      const elapsed = Date.now() - startTime;
      if (elapsed < 400 && !silent) {
        await new Promise((r) => setTimeout(r, 400 - elapsed));
      }

      setConsultations(cRes.data.data || []);
      setPrescriptions(pRes.data.data || []);
      setLabOrders(loRes.data.data || []);
      setLabReports(lrRes.data.data || []);
    } catch (e: any) {
      const handled = handleApiError(e);
      setColdStart(!!handled.isColdStart);
      setError(handled.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll(true);
    setRefreshing(false);
  };

  const currentList =
    activeTab === 'consultations' ? consultations :
    activeTab === 'prescriptions' ? prescriptions :
    activeTab === 'labOrders' ? labOrders :
    labReports;

  const emptyConfig: Record<RecordsTab, { title: string; desc: string }> = {
    consultations: { title: t('noConsultations'), desc: t('noConsultationsDesc') },
    prescriptions: { title: t('noPrescriptions'), desc: t('noPrescriptionsDesc') },
    labOrders: { title: t('noLabOrders'), desc: t('noLabOrdersDesc') },
    labReports: { title: t('noLabReports'), desc: t('noLabReportsDesc') },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('myRecords').replace('\n', ' ')}</Text>
        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [styles.refreshBtn, { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
        >
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsBar}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={({ pressed }) => [
                styles.tabBtn,
                active ? styles.tabBtnActive : null,
                { opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Ionicons
                name={tab.icon}
                size={16}
                color={active ? colors.white : colors.textMuted}
              />
              <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xxxl }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {error && !loading && (
          <ErrorState
            message={error}
            onRetry={() => fetchAll()}
            retryLabel={t('retry')}
          />
        )}

        {coldStart && loading && (
          <View style={styles.coldMsg}>
            <Ionicons name="cloud-outline" size={18} color={colors.signalBlue} />
            <Text style={styles.coldMsgText}>{t('coldStart')}</Text>
          </View>
        )}

        {loading && (
          <View style={{ gap: spacing.md }}>
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <Skeleton width="60%" height={18} />
                <Skeleton width="100%" height={14} style={{ marginTop: spacing.md }} />
                <Skeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
                <Skeleton width="40%" height={12} style={{ marginTop: spacing.lg }} />
              </Card>
            ))}
          </View>
        )}

        {!loading && !error && currentList.length === 0 && (
          <EmptyState
            icon={<Ionicons name="folder-open-outline" size={30} color={colors.primary} />}
            title={emptyConfig[activeTab].title}
            description={emptyConfig[activeTab].desc}
          />
        )}

        {!loading && !error && currentList.length > 0 && (
          <View style={{ gap: spacing.md }}>
            {activeTab === 'consultations' && consultations.map((item, idx) => (
              <ConsultationCard key={item.id || idx} item={item} t={t} index={idx} />
            ))}
            {activeTab === 'prescriptions' && prescriptions.map((item, idx) => (
              <PrescriptionCard key={item.id || idx} item={item} t={t} index={idx} />
            ))}
            {activeTab === 'labOrders' && labOrders.map((item, idx) => (
              <LabOrderCard key={item.id || idx} item={item} t={t} index={idx} />
            ))}
            {activeTab === 'labReports' && labReports.map((item, idx) => (
              <LabReportCard key={item.id || idx} item={item} t={t} index={idx} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const ConsultationCard: React.FC<{ item: any; t: (k: any) => string; index: number }> = ({ item, t, index }) => (
  <Card style={{ opacity: 0.99 }}>
    <View style={styles.cardTopRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardDate}>{formatRelativeTime(item.consultation_date || item.created_at)}</Text>
      </View>
      {item.status && (
        <Badge label={item.status === 'ongoing' ? t('ongoing') : item.status === 'awaiting_report' ? t('awaitingReport') : item.status === 'completed' ? t('completed') : capitalize(item.status)}
          variant={getStatusBadgeVariant(item.status)} />
      )}
    </View>
    {item.probable_diagnosis && (
      <Text style={styles.cardHeading}>{item.probable_diagnosis}</Text>
    )}
    {item.confirmed_diagnosis && item.confirmed_diagnosis !== item.probable_diagnosis && (
      <Text style={[styles.cardSubHeading, { color: colors.signalBlue, marginTop: 2 }]}>
        {t('diagnosis')}: {item.confirmed_diagnosis}
      </Text>
    )}
    {item.symptoms && (
      <DetailRow label={t('symptoms')} value={item.symptoms} />
    )}
    {item.doctor_notes && (
      <DetailRow label={t('doctorNotes')} value={item.doctor_notes} />
    )}
  </Card>
);

const PrescriptionCard: React.FC<{ item: any; t: (k: any) => string; index: number }> = ({ item, t, index }) => (
  <Card>
    <View style={styles.cardTopRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardDate}>{formatRelativeTime(item.created_at)}</Text>
      </View>
      <View style={styles.pillIcon}>
        <Ionicons name="medkit" size={16} color={colors.primary} />
      </View>
    </View>
    <Text style={styles.cardHeading}>{item.medicine_name}</Text>
    <View style={styles.prescGrid}>
      {item.dosage && <PrescItem label={t('dosage')} value={item.dosage} />}
      {item.frequency && <PrescItem label={t('frequency')} value={item.frequency} />}
      {item.duration && <PrescItem label={t('duration')} value={item.duration} />}
    </View>
    {item.instructions && (
      <DetailRow label={t('instructions')} value={item.instructions} />
    )}
  </Card>
);

const LabOrderCard: React.FC<{ item: any; t: (k: any) => string; index: number }> = ({ item, t, index }) => (
  <Card>
    <View style={styles.cardTopRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardDate}>{formatRelativeTime(item.ordered_at || item.created_at)}</Text>
      </View>
      {item.status && (
        <Badge
          label={item.status === 'pending' ? t('pending') : item.status === 'in_progress' ? t('inProgress') : t('completed')}
          variant={getStatusBadgeVariant(item.status)}
        />
      )}
    </View>
    <Text style={styles.cardHeading}>{item.test_name}</Text>
    <View style={[styles.prescGrid, { marginTop: spacing.sm }]}>
      <PrescItem label={t('orderedAt')} value={formatDate(item.ordered_at || item.created_at, 'dateOnly')} />
    </View>
  </Card>
);

const LabReportCard: React.FC<{ item: any; t: (k: any) => string; index: number }> = ({ item, t, index }) => {
  const handleOpenReport = async () => {
    if (!item.report_file_url) return;
    try {
      await WebBrowser.openBrowserAsync(item.report_file_url);
    } catch {
      Linking.openURL(item.report_file_url);
    }
  };

  return (
    <Card>
      <View style={styles.cardTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardDate}>{formatRelativeTime(item.uploaded_at || item.created_at)}</Text>
        </View>
        <Badge label={t('reportReady')} variant="success" />
      </View>
      <Text style={styles.cardHeading}>Lab Report</Text>
      {item.report_summary && (
        <Text style={styles.cardBodyText}>{item.report_summary}</Text>
      )}
      {item.report_file_url && (
        <Pressable
          style={({ pressed }) => [styles.viewBtn, { opacity: pressed ? 0.8 : 1 }]}
          onPress={handleOpenReport}
        >
          <Ionicons name="open-outline" size={16} color={colors.primary} />
          <Text style={styles.viewBtnText}>View Full Report</Text>
        </Pressable>
      )}
    </Card>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={{ marginTop: spacing.md }}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const PrescItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.prescItem}>
    <Text style={styles.prescItemLabel}>{label}</Text>
    <Text style={styles.prescItemValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsBar: {
    paddingHorizontal: spacing.lg - spacing.sm / 2,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    ...shadows.card,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    ...shadows.elevated,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.white,
  },
  coldMsg: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#E3F2FD',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  coldMsgText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.signalBlue,
    fontWeight: '500',
    lineHeight: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardHeading: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardSubHeading: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  cardBodyText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  pillIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prescGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  prescItem: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    minWidth: '30%',
    flex: 1,
  },
  prescItemLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  prescItemValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : undefined,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  viewBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
