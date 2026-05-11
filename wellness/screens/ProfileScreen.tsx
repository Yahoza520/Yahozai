import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { getUserId, clearAllData } from '../modules/storage';
import { cancelAllNotifications } from '../modules/notifications';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

/**
 * Profil ekranı — Kullanıcı bilgileri ve KVKK geri çekme (tam veri silme).
 */
export default function ProfileScreen({ navigation }: Props) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    getUserId().then(setUserId);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Tüm yerel verileriniz (program, ilerleme, streak) silinecek. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil ve Çık',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            await clearAllData();
            navigation.replace('Splash');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profil</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kullanıcı ID</Text>
          <Text style={styles.userId}>
            {userId ? userId.slice(0, 8) + '...' : 'Yükleniyor...'}
          </Text>
          <Text style={styles.userIdNote}>
            Verileriniz anonim olarak saklanır. Kişisel bilgi içermez.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ayarlar</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingText}>Program Ayarları</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Gizlilik</Text>
          <View style={styles.privacyBox}>
            <Text style={styles.privacyText}>
              KVKK / GDPR kapsamında tüm verileriniz yalnızca bu cihazda saklanır.
              Silmek için aşağıdaki butonu kullanın.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Verileri Sil ve Çıkış Yap</Text>
        </TouchableOpacity>

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
  userId: { fontSize: 14, color: '#1E293B', fontFamily: 'monospace' },
  userIdNote: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  settingText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  settingArrow: { fontSize: 18, color: '#CBD5E1' },
  privacyBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90D9',
  },
  privacyText: { fontSize: 12, color: '#1E40AF', lineHeight: 18 },
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
