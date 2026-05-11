import React, { useState } from 'react';
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
import { logAction } from '../modules/audit-logger';
import crypto from 'crypto';

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyConsent'>;

/**
 * KVKK/GDPR bilgilendirme ve onay ekranı.
 * Kabul edilmezse uygulama kapanır, kabul edilirse userId ile Wizard'a geçilir.
 */
export default function PrivacyConsentScreen({ navigation }: Props) {
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    if (!agreed) return;

    // Anonim UUID oluştur
    const userId = crypto.randomUUID();

    // Consent logla
    await logAction(userId, 'KULLANICI_GIRIS', 'PrivacyConsentScreen', 'SUCCESS');

    // Wizard'a geç
    navigation.replace('Wizard', { userId });
  };

  const handleReject = () => {
    // Uygulamayı kapat — gerçek uygulamada BackHandler.exitApp()
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Gizlilik & Kullanıcı Sözleşmesi</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Kişisel Verilerin Korunması</Text>
          <Text style={styles.sectionText}>
            Türk Kişisel Verileri Koruma Kanunu (KVKK) ve Avrupa Birliği Genel Veri Koruma
            Yönetmeliği (GDPR) kapsamında verileriniz yüksek güvenlikle saklanır.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Anonim İşleme</Text>
          <Text style={styles.sectionText}>
            Adınız, e-posta adresiniz ve kimlik numaranız loglanmaz. Tüm veriler benzersiz
            anonim kimliklerle işlenir.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✋ Haklarınız</Text>
          <Text style={styles.sectionText}>
            Verilerinize erişim, düzeltme, silme ve taşınabilirlik haklarına sahipsiniz.
            İstekte bulunmak için [privacy@wellness.local] adresine yazınız.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚕️ Kategori I SaMD</Text>
          <Text style={styles.sectionText}>
            Bu uygulama tıbbi aygıt olarak sınıflandırılmakta; sunulan sonuçlar kesin tanı
            niteliği taşımamaktadır. Her zaman bir sağlık uzmanıyla danışınız.
          </Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            Uygulamayı kullanarak KVKK / GDPR şartlarını ve bu aygıtın tıbbi kararlar için
            kullanılamayacağını kabul etmiş sayılırsınız.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {/* Checkbox */}
        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
        >
          <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
            {agreed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Tüm şartları okudum ve kabul ediyorum
          </Text>
        </TouchableOpacity>

        {/* Butonlar */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={handleReject}
          >
            <Text style={styles.rejectBtnText}>Reddet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.acceptBtn, !agreed && styles.acceptBtnDisabled]}
            onPress={handleAccept}
            disabled={!agreed}
          >
            <Text style={styles.acceptBtnText}>Kabul Et & Başla</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 20 },
  heading: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginBottom: 24, marginTop: 8 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1D4ED8', marginBottom: 8 },
  sectionText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    borderRadius: 8,
    padding: 14,
    marginTop: 24,
  },
  disclaimerText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4A90D9', borderColor: '#4A90D9' },
  checkmark: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  checkboxLabel: { flex: 1, fontSize: 13, color: '#475569' },
  buttonGroup: { flexDirection: 'row', gap: 12 },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  rejectBtnText: { color: '#64748B', fontWeight: '700', fontSize: 14 },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptBtnDisabled: { backgroundColor: '#CBD5E1' },
  acceptBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
