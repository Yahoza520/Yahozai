import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

/**
 * Profil ekranı — Kullanıcı bilgileri ve tercihler.
 */
export default function ProfileScreen({ navigation }: Props) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userId');
    navigation.replace('Splash' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profil</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Kullanıcı ID</Text>
          <Text style={styles.userId}>{userId ? userId.slice(0, 8) + '...' : 'Yükleniyor...'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ayarlar</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Bildirim Ayarları</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Gizlilik ve Güvenlik</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
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
  userId: { fontSize: 14, color: '#1E293B', fontFamily: 'monospace' },
  settingItem: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  settingText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  logoutBtn: { marginHorizontal: 20, marginTop: 24, backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  logoutText: { color: '#FFF', fontWeight: '700', fontSize: 14 },
});
