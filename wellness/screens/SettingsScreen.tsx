import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { getUserId, getProgram } from '../modules/storage';
import {
  scheduleStreakReminder,
  cancelAllNotifications,
  requestNotificationPermission,
} from '../modules/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

/**
 * Ayarlar ekranı — Program güncelleme, bildirim kontrolü, veri yönetimi.
 */
export default function SettingsScreen({ navigation }: Props) {
  const [streakReminder, setStreakReminder] = useState(true);

  const handleChangeProgram = async () => {
    const userId = await getUserId();
    if (!userId) return;
    Alert.alert(
      'Programı Değiştir',
      'Mevcut programınız silinecek ve soruları yeniden cevaplayacaksınız.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Devam Et',
          onPress: () => navigation.navigate('Wizard', { userId }),
        },
      ],
    );
  };

  const handleStreakReminderToggle = async (value: boolean) => {
    setStreakReminder(value);
    if (value) {
      const ok = await requestNotificationPermission();
      if (ok) {
        await scheduleStreakReminder();
      } else {
        setStreakReminder(false);
      }
    } else {
      await cancelAllNotifications();
      // Program bildirimlerini yeniden kur, sadece streak'i kapat
      const program = await getProgram();
      if (program) {
        const { scheduleSessionReminders } = await import('../modules/notifications');
        await scheduleSessionReminders(program);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Ayarlar</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Program</Text>
          <TouchableOpacity style={styles.settingItem} onPress={handleChangeProgram}>
            <View>
              <Text style={styles.settingText}>Programımı Değiştir</Text>
              <Text style={styles.settingHint}>Soruları yeniden cevaplayarak program güncelle</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Bildirimler</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingTextGroup}>
              <Text style={styles.settingText}>Streak Hatırlatıcısı</Text>
              <Text style={styles.settingHint}>Akşam 21:00 — seans yapılmadıysa uyarı</Text>
            </View>
            <Switch
              value={streakReminder}
              onValueChange={handleStreakReminderToggle}
              trackColor={{ false: '#E2E8F0', true: '#4A90D9' }}
              thumbColor="#FFF"
            />
          </View>
          <View style={[styles.settingItem, { opacity: 0.5 }]}>
            <View>
              <Text style={styles.settingText}>Seans Saatleri</Text>
              <Text style={styles.settingHint}>Program otomatik olarak zamanlar</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Veriler</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View>
              <Text style={styles.settingText}>Veri Yönetimi</Text>
              <Text style={styles.settingHint}>KVKK kapsamında tüm verileri sil</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>ℹ️ İpucu</Text>
          <Text style={styles.infoText}>
            Seansları düzenli ve aynı saatlerde yapmanız en iyi sonuçları sağlar.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: { fontSize: 14, color: '#4A90D9', fontWeight: '600', width: 40 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1E293B' },
  section: { padding: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingTextGroup: { flex: 1 },
  settingText: { fontSize: 14, color: '#1E293B', fontWeight: '600' },
  settingHint: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  settingArrow: { fontSize: 18, color: '#CBD5E1' },
  infoBox: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90D9',
  },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  infoText: { fontSize: 12, color: '#1E40AF', marginTop: 4, lineHeight: 18 },
});
