import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import { logAction } from '../modules/audit-logger';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const MAX_DAILY_MINUTES = 90;

/**
 * Frekans seans oynatıcı ekranı.
 * Geri sayım, dalga animasyonu ve seans tamamlama akışını yönetir.
 */
export default function PlayerScreen({ navigation, route }: Props) {
  const { session, userId } = route.params;
  const totalSeconds = session.durationMin * 60;

  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const waveAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const startWave = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1.18,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [waveAnim]);

  const stopWave = useCallback(() => {
    waveAnim.stopAnimation();
    waveAnim.setValue(1);
  }, [waveAnim]);

  const handleComplete = useCallback(async () => {
    clearInterval(intervalRef.current!);
    setIsPlaying(false);
    setIsCompleted(true);
    stopWave();
    await logAction(userId, 'SEANS_BITIS', 'PlayerScreen', 'SUCCESS', session.label);
  }, [userId, session.label, stopWave]);

  const handleStart = useCallback(async () => {
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    startWave();
    await logAction(userId, 'SEANS_BASLANGIC', 'PlayerScreen', 'SUCCESS', session.label);
  }, [userId, session.label, startWave]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    stopWave();
    clearInterval(intervalRef.current!);
  }, [stopWave]);

  const handleStop = useCallback(async () => {
    clearInterval(intervalRef.current!);
    setIsPlaying(false);
    stopWave();
    await logAction(userId, 'SEANS_BITIS', 'PlayerScreen', 'FAILURE', session.label);
    navigation.goBack();
  }, [userId, session.label, stopWave, navigation]);

  useEffect(() => {
    if (!isPlaying) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [isPlaying, handleComplete]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = 1 - secondsLeft / totalSeconds;

  if (isCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedBox}>
          <Text style={styles.completedIcon}>✓</Text>
          <Text style={styles.completedTitle}>Seans Tamamlandı</Text>
          <Text style={styles.completedSub}>{session.label}</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.doneBtnText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleStop} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{session.label}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Dalga animasyonu */}
      <View style={styles.waveContainer}>
        <Animated.View style={[styles.waveOuter, { transform: [{ scale: waveAnim }] }]}>
          <View style={styles.waveInner}>
            <Text style={styles.freqText}>{session.frequency} Hz</Text>
            <Text style={styles.freqType}>{session.type}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Timer */}
      <Text style={styles.timer}>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Text>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Notlar */}
      <Text style={styles.notes}>{session.notes}</Text>

      {/* Maksimum günlük süre uyarısı */}
      <Text style={styles.limitNote}>Günlük maksimum: {MAX_DAILY_MINUTES} dk</Text>

      {/* Kontroller */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.stopBtn} onPress={handleStop}>
          <Text style={styles.stopBtnText}>Durdur</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={isPlaying ? handlePause : handleStart}
        >
          <Text style={styles.playBtnText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    width: '100%',
  },
  closeBtn: { width: 36, height: 36, justifyContent: 'center' },
  closeText: { color: '#94A3B8', fontSize: 18 },
  title: { flex: 1, textAlign: 'center', color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
  waveContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  waveOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(74, 144, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(74, 144, 217, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqText: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  freqType: { color: '#93C5FD', fontSize: 12, marginTop: 4 },
  timer: { fontSize: 48, fontWeight: '800', color: '#F8FAFC', letterSpacing: 2 },
  progressBar: {
    width: '70%',
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4A90D9', borderRadius: 2 },
  notes: { color: '#64748B', fontSize: 12, marginTop: 16, paddingHorizontal: 32, textAlign: 'center' },
  limitNote: { color: '#334155', fontSize: 11, marginTop: 8 },
  controls: {
    flexDirection: 'row',
    gap: 20,
    paddingBottom: 40,
    paddingTop: 24,
    alignItems: 'center',
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: { color: '#FFF', fontSize: 24 },
  stopBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stopBtnText: { color: '#94A3B8', fontSize: 14 },
  completedBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  completedIcon: { fontSize: 64, marginBottom: 16 },
  completedTitle: { fontSize: 24, fontWeight: '800', color: '#22C55E', marginBottom: 8 },
  completedSub: { fontSize: 14, color: '#94A3B8', marginBottom: 32 },
  doneBtn: {
    backgroundColor: '#4A90D9',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  doneBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
});
