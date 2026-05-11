import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

/**
 * Açılış ekranı — logo + yükleme animasyonu (1.5 sn).
 * Daha sonra kayıtlı kullanıcı varsa Home'a, yoksa Onboarding'e geçer.
 */
export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mock: kayıtlı kullanıcı kontrolü
      const isRegistered = false; // AsyncStorage'dan gelir

      if (isRegistered) {
        navigation.replace('Home', { userId: 'usr_registered' });
      } else {
        navigation.replace('Onboarding');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>✨</Text>
        <Text style={styles.title}>Wellness</Text>
        <Text style={styles.subtitle}>Kişisel Frekans Programı</Text>
        <ActivityIndicator size="large" color="#4A90D9" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', color: '#1E293B' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8 },
  loader: { marginTop: 32 },
});
