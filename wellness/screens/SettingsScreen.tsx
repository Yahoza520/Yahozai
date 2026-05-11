import React from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/**
 * Ayarlar ekranı — Program özelleştirme ve tercihler.
 */
export default function SettingsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Program</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Programımı Değiştir</Text>
            <Text style={styles.settingHint}>Seçili protokolleri özelleştir</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bildirimler</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Seans Hatırlatıcısı</Text>
            <Text style={styles.settingHint}>Günlük seanslar için hatırlatma</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Saat Ayarla</Text>
            <Text style={styles.settingHint}>İlk seans saati</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Veriler</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>İlerlemeyi Sıfırla</Text>
            <Text style={styles.settingHint}>Günlük ilerleme verisini sıfırla</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ℹ️ İpucu</Text>
          <Text style={styles.infoText}>Seansları düzenli ve aynı saatlerde yapmanız en iyi sonuçları sağlar.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1E293B' },
  section: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: 8 },
  settingItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  settingText: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  settingHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  infoBox: { marginHorizontal: 20, marginTop: 20, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#4A90D9' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  infoText: { fontSize: 12, color: '#1E40AF', marginTop: 4, lineHeight: 18 },
});
