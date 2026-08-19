import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../src/constants/theme';
import { Card, Badge } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { aiApi, handleApiError } from '../../src/services/api';

type ScanState = 'idle' | 'picking' | 'uploading' | 'success' | 'error';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
}

interface ScanResult {
  medicines: Medicine[];
  explanation: string;
  disclaimer: string;
}

export default function ScanScreen() {
  const { t } = useAuth();
  const [state, setState] = useState<ScanState>('idle');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setState('idle');
    setImageUri(null);
    setResult(null);
    setErrorMsg(null);
  };

  const processImage = async (uri: string, mimeType: string, fileName: string) => {
    setState('uploading');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      const fileObj: any = {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        type: mimeType || 'image/jpeg',
        name: fileName || `prescription_${Date.now()}.jpg`,
      };
      formData.append('file', fileObj);

      const res = await aiApi.scanPrescription(formData);
      const data = res.data.data as ScanResult;
      if (data) {
        setResult(data);
        setState('success');
      } else {
        throw new Error('No data returned');
      }
    } catch (e: any) {
      const handled = handleApiError(e);
      setErrorMsg(handled.message);
      setState('error');
    }
  };

  const takePhoto = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Camera permission is needed to take a photo of your prescription.');
        return;
      }
      setState('picking');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
        presentationStyle: 0,
      });
      if (result.canceled) {
        setState('idle');
        return;
      }
      const asset = result.assets[0];
      setImageUri(asset.uri);
      processImage(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'prescription.jpg');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open camera');
      setState('idle');
    }
  }, []);

  const pickFromGallery = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission Required', 'Gallery permission is needed to select a prescription image.');
        return;
      }
      setState('picking');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });
      if (result.canceled) {
        setState('idle');
        return;
      }
      const asset = result.assets[0];
      setImageUri(asset.uri);
      processImage(asset.uri, asset.mimeType || 'image/jpeg', asset.fileName || 'prescription.jpg');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to open gallery');
      setState('idle');
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('scanTitle')}</Text>
          <Text style={styles.subtitle}>{t('scanSubtitle')}</Text>
        </View>

        {(state === 'idle' || state === 'picking') && (
          <View style={styles.actionsArea}>
            <Pressable
              onPress={takePhoto}
              disabled={state === 'picking'}
              style={({ pressed }) => [
                styles.uploadCard,
                pressed ? { opacity: 0.9, transform: [{ scale: 0.99 }] } : null,
                state === 'picking' ? { opacity: 0.6 } : null,
              ]}
            >
              <View style={[styles.uploadIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="camera" size={32} color={colors.primary} />
              </View>
              <Text style={styles.uploadTitle}>{t('takePhoto')}</Text>
              <Text style={styles.uploadSub}>Use your camera to capture the prescription</Text>
            </Pressable>

            <Pressable
              onPress={pickFromGallery}
              disabled={state === 'picking'}
              style={({ pressed }) => [
                styles.uploadCard,
                { borderStyle: 'dashed' },
                pressed ? { opacity: 0.9, transform: [{ scale: 0.99 }] } : null,
                state === 'picking' ? { opacity: 0.6 } : null,
              ]}
            >
              <View style={[styles.uploadIcon, { backgroundColor: '#E3F2FD' }]}>
                <Ionicons name="images" size={32} color={colors.signalBlue} />
              </View>
              <Text style={styles.uploadTitle}>{t('pickFromGallery')}</Text>
              <Text style={styles.uploadSub}>Select an existing image from your photos</Text>
            </Pressable>
          </View>
        )}

        {state === 'uploading' && (
          <View style={styles.processingArea}>
            {imageUri && (
              <View style={styles.previewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} />
              </View>
            )}
            <View style={styles.skeletonGroup}>
              <Text style={styles.skeletonTitle}>{t('analyzing')}</Text>
              <Text style={styles.skeletonSub}>{t('analyzingSubtitle')}</Text>
              {[0, 1, 2].map(i => (
                <View key={i} style={[styles.skeletonLine, { opacity: 0.8 - i * 0.2 }]} />
              ))}
              <View style={styles.skeletonBottom}>
                <View style={styles.skeletonBadge} />
                <View style={[styles.skeletonBadge, { width: 120 }]} />
              </View>
            </View>
          </View>
        )}

        {(state === 'success' || state === 'error') && (
          <View style={{ gap: spacing.md }}>
            {imageUri && (
              <Card padding={spacing.sm}>
                <Image source={{ uri: imageUri }} style={styles.resultPreview} />
              </Card>
            )}

            {state === 'error' && errorMsg && (
              <Card>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                  <Ionicons name="alert-circle" size={22} color={colors.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.errTitle}>Unable to scan prescription</Text>
                    <Text style={styles.errText}>{errorMsg}</Text>
                  </View>
                </View>
              </Card>
            )}

            {state === 'success' && result && (
              <>
                <Card>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="medkit" size={20} color={colors.primary} />
                    <Text style={styles.sectionTitle}>{t('medicinesFound')}</Text>
                    <Badge label={`${result.medicines.length} item${result.medicines.length !== 1 ? 's' : ''}`} variant="primary" />
                  </View>
                  <View style={{ marginTop: spacing.md, gap: spacing.md }}>
                    {result.medicines.map((med, idx) => (
                      <View key={idx} style={styles.medicineRow}>
                        <View style={styles.medicineNum}>
                          <Text style={styles.medicineNumText}>{idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.medicineName}>{med.name}</Text>
                          <View style={styles.medicineMeta}>
                            {med.dosage && (
                              <View style={styles.metaTag}>
                                <Text style={styles.metaTagLabel}>{t('dosage')}</Text>
                                <Text style={styles.metaTagValue}>{med.dosage}</Text>
                              </View>
                            )}
                            {med.frequency && (
                              <View style={styles.metaTag}>
                                <Text style={styles.metaTagLabel}>{t('frequency')}</Text>
                                <Text style={styles.metaTagValue}>{med.frequency}</Text>
                              </View>
                            )}
                          </View>
                          {med.instructions && (
                            <Text style={styles.medicineInstr}>{med.instructions}</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>

                <Card style={{ backgroundColor: colors.primaryLight }}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{t('explanation')}</Text>
                  </View>
                  <Text style={styles.explanationText}>{result.explanation}</Text>
                </Card>

                <Card style={{ borderWidth: 1, borderColor: colors.honeyGold + '55', backgroundColor: '#FFF8E1' }}>
                  <View style={[styles.sectionHeader, { alignItems: 'flex-start' }]}>
                    <Ionicons name="warning" size={20} color={colors.honeyGold} />
                    <Text style={[styles.sectionTitle, { color: '#8D6E10' }]}>{t('disclaimer')}</Text>
                  </View>
                  <Text style={styles.disclaimerText}>{result.disclaimer}</Text>
                </Card>
              </>
            )}

            <Button
              title={t('scanAgain')}
              variant="primary"
              onPress={reset}
              fullWidth
              size="lg"
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  header: { marginBottom: spacing.xxl },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: fontSize.md, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 22 },
  actionsArea: { gap: spacing.md },
  uploadCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    ...shadows.card,
  },
  uploadIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  uploadSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  processingArea: {
    gap: spacing.md,
  },
  previewBox: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
    ...shadows.card,
  },
  previewImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  skeletonGroup: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  skeletonTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  skeletonSub: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  skeletonLine: {
    height: 14,
    backgroundColor: colors.primaryLight,
    borderRadius: 7,
    marginBottom: spacing.sm,
  },
  skeletonBottom: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.sm,
  },
  resultPreview: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    resizeMode: 'cover',
  },
  errTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.accent, marginBottom: 2 },
  errText: { fontSize: fontSize.sm, color: colors.text, lineHeight: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  medicineRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  medicineNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineNumText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  medicineName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  medicineMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  metaTagLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaTagValue: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.primary,
    fontFamily: 'System',
  },
  medicineInstr: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  explanationText: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    fontSize: fontSize.sm,
    color: '#6D5814',
    lineHeight: 20,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});
