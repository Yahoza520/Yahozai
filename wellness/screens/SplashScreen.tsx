import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { getUserId } from '../modules/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

/**
 * Açılış ekranı — logo + yükleme animasyonu (1.5 sn).
 * Kayıtlı userId varsa Home'a, yoksa Onboarding'e geçer.
 */
export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const bootstrap = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const userId = await getUserId();
      if (userId) {
        navigation.replace('Home', { userId });
      } else {
        navigation.replace('Onboarding');
      }
    };

    bootstrap();
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
