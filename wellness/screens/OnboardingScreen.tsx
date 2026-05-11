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

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface Slide {
  icon: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: '🎵',
    title: 'Kişisel Frekans',
    description: 'Cevaplarınıza göre size özel frekans programı oluşturuyoruz.',
  },
  {
    icon: '📊',
    title: 'Detaylı Tarama',
    description: 'Sağlık durumunuzu anlamak için kapsamlı soruları cevaplıyorsunuz.',
  },
  {
    icon: '🎯',
    title: 'Günlük Program',
    description: 'Her gün ayarlanan seanslarla frekans uygulamasına başlıyorsunuz.',
  },
];

/**
 * Onboarding ekranı — 3 slayt ile wellness konsepti tanıtımı.
 */
export default function OnboardingScreen({ navigation }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigation.replace('PrivacyConsent');
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} scrollEnabled={false}>
        <Text style={styles.icon}>{slide.icon}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>

        {/* Nokta göstergesi */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentSlide && styles.dotActive]}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>
            {currentSlide === SLIDES.length - 1 ? 'Başla' : 'İleri'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, color: '#64748B', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', gap: 8, marginTop: 48, justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1' },
  dotActive: { backgroundColor: '#4A90D9', width: 24 },
  footer: { padding: 20 },
  button: { backgroundColor: '#4A90D9', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
