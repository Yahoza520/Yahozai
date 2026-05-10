import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import type { ScoreDimension } from '../shared/types';
import { logAction } from '../modules/audit-logger';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  enerji: 'Enerji',
  norolojik: 'Sinir Sistemi',
  metabolik: 'Metabolizma',
  inflamasyon: 'İnflamasyon',
  sindirim: 'Sindirim',
  hormonal: 'Hormonal Denge',
  immun: 'Bağışıklık',
  kardiyovaskuler: 'Kardiyovasküler',
  biyorezonans: 'Biyorezonans',
};

const SCORE_LEVEL = (score: number): { label: string; color: string } => {
  if (score <= 4) return { label: 'Dengeli', color: '#22C55E' };
  if (score <= 9) return { label: 'Dikkat', color: '#F59E0B' };
  return { label: 'Destek Gerekli', color: '#EF4444' };
};

/**
 * Wellness profil sonuç ekranı. Skor boyutlarını ve dominant alanları gösterir.
 */
export default function ResultScreen({ navigation, route }: Props) {
  const { program, userId, error } = route.params;

  useEffect(() => {
    logAction(userId, 'VERI_GORUNTULEME', 'ResultScreen', 'SUCCESS');
  }, [userId]);

  if (error || !program) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error ?? 'Bir hata oluştu.'}</Text>
          <TouchableOpacity onPress={() => navigation.replace('Wizard', { userId })}>
            <Text style={styles.retryText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { scores, dominantDimensions } = program;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Wellness Profiliniz</Text>
        <Text style={styles.subheading}>
          En yüksek skorlu {dominantDimensions.length} alan için kişisel frekans
          programınız hazırlandı.
        </Text>

        {/* Skor Listesi */}
        <View style={styles.scoreList}>
          {(Object.keys(scores) as ScoreDimension[]).map((dim) => {
            const level = SCORE_LEVEL(scores[dim]);
            return (
              <View key={dim} style={styles.scoreRow}>
                <Text style={styles.dimLabel}>{DIMENSION_LABELS[dim]}</Text>
                <View style={styles.scoreRight}>
                  <View style={[styles.scoreBadge, { backgroundColor: level.color + '20' }]}>
                    <Text style={[styles.scoreBadgeText, { color: level.color }]}>
                      {level.label}
                    </Text>
                  </View>
                  <Text style={styles.scoreValue}>{scores[dim]}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Yasal uyarı — Kategori I SaMD zorunluluğu */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Bu sonuçlar tıbbi teşhis niteliği taşımaz. Sağlık sorunlarınız için
            mutlaka bir sağlık uzmanına başvurunuz.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('FrequencyProgram', { program, userId })}
        >
          <Text style={styles.ctaText}>Frekans Programımı Gör</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 8 },
  subheading: { fontSize: 14, color: '#64748B', marginBottom: 24, lineHeight: 20 },
  scoreList: { gap: 12 },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  dimLabel: { fontSize: 14, color: '#334155', fontWeight: '600' },
  scoreRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  scoreBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  scoreBadgeText: { fontSize: 11, fontWeight: '700' },
  scoreValue: { fontSize: 16, fontWeight: '800', color: '#1E293B', minWidth: 24, textAlign: 'right' },
  disclaimer: {
    marginTop: 24,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  disclaimerText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  ctaBtn: {
    marginTop: 24,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  errorBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { fontSize: 16, color: '#EF4444', textAlign: 'center', marginBottom: 16 },
  retryText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
});
