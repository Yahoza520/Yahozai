import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { QUESTIONS } from '../modules/clinical-dashboard/question-bank';
import { calculateScores, getDominantDimensions, requiresExpertReferral } from '../shared/utils/score-engine';
import { matchProtocols, prioritizeProtocols } from '../shared/utils/protocol-matcher';
import { buildProgram } from '../shared/utils/program-builder';
import { logAction } from '../modules/audit-logger';

type Props = NativeStackScreenProps<RootStackParamList, 'Analysis'>;

/**
 * Skor hesaplama ve protokol atama ekranı.
 * 2–3 saniye animasyon eşliğinde arka planda işlem yapar, sonra geçiş yapar.
 */
export default function AnalysisScreen({ navigation, route }: Props) {
  const { answers, userId, programDuration } = route.params;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(async () => {
      try {
        const scores = calculateScores(answers, QUESTIONS);
        const dominantDimensions = getDominantDimensions(scores, 3);
        const matched = matchProtocols(scores);
        const prioritized = prioritizeProtocols(matched, dominantDimensions);
        const program = buildProgram(
          userId,
          scores,
          dominantDimensions,
          prioritized,
          programDuration,
        );

        await logAction(userId, 'VERI_GORUNTULEME', 'AnalysisScreen', 'SUCCESS');

        if (requiresExpertReferral(scores)) {
          navigation.replace('ExpertReferral', { program, userId });
        } else {
          navigation.replace('Result', { program, userId });
        }
      } catch {
        await logAction(userId, 'VERI_GORUNTULEME', 'AnalysisScreen', 'FAILURE');
        navigation.replace('Result', {
          program: null,
          userId,
          error: 'Analiz tamamlanamadı.',
        });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [answers, userId, programDuration, navigation, spinAnim, fadeAnim]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate }] }]} />
        <Text style={styles.title}>Profiliniz oluşturuluyor</Text>
        <Text style={styles.subtitle}>Cevaplarınız analiz ediliyor…</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center' },
  content: { alignItems: 'center', paddingHorizontal: 32 },
  spinner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    borderTopColor: '#4A90D9',
    marginBottom: 32,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' },
});
