import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigation-types';
import type { WeekDay, UserProgram } from '../shared/types';
import { FREQUENCY_PROTOCOLS } from '../modules/clinical-dashboard/frequency-catalog';
import { logAction } from '../modules/audit-logger';
import { getProgram, getCompletionsForDate, getStreak } from '../modules/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const WEEK_DAYS: WeekDay[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];
const TODAY_INDEX = new Date().getDay();
const TODAY_KEY = WEEK_DAYS[TODAY_INDEX];

const DAY_LABELS: Record<WeekDay, string> = {
  sunday: 'Pazar',
  monday: 'Pazartesi',
  tuesday: 'Salı',
  wednesday: 'Çarşamba',
  thursday: 'Perşembe',
  friday: 'Cuma',
  saturday: 'Cumartesi',
};

interface DailySession {
  protocolId: string;
  sessionKey: string;
  label: string;
  frequency: number;
  durationMin: number;
  completed: boolean;
}

/**
 * Ana ekran — günlük frekans programı, ilerleme ve quick actions.
 * AsyncStorage'dan program ve session geçmişi yüklenir.
 */
export default function HomeScreen({ navigation, route }: Props) {
  const { userId } = route.params;

  const [greeting, setGreeting] = useState('Merhaba');
  const [todaySessions, setTodaySessions] = useState<DailySession[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [program, setProgram] = useState<UserProgram | null>(null);

  const loadData = useCallback(async () => {
    logAction(userId, 'VERI_GORUNTULEME', 'HomeScreen', 'SUCCESS');

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('Öğleden sonra');
    else setGreeting('İyi akşamlar');

    const [savedProgram, completions, streakData] = await Promise.all([
      getProgram(),
      getCompletionsForDate(),
      getStreak(),
    ]);

    setProgram(savedProgram);
    setStreak(streakData.count);

    if (!savedProgram) {
      setTodaySessions([]);
      setTotalCount(0);
      setCompletedCount(0);
      return;
    }

    const todaySessionKeys: string[] = savedProgram.weeklyPlan[TODAY_KEY] ?? [];
    const completedKeys = new Set(completions.map((c) => c.sessionKey));

    const sessions: DailySession[] = todaySessionKeys.flatMap((key) => {
      const [protocolId, timeKey] = key.split('.');
      const protocol = FREQUENCY_PROTOCOLS.find((p) => p.protocolId === protocolId);
      const session = protocol?.sessions.find((s) => s.time === timeKey);
      if (!session) return [];
      return [{
        protocolId,
        sessionKey: key,
        label: session.label,
        frequency: session.frequency,
        durationMin: session.durationMin,
        completed: completedKeys.has(key),
      }];
    });

    setTodaySessions(sessions);
    setTotalCount(sessions.length);
    setCompletedCount(sessions.filter((s) => s.completed).length);
  }, [userId]);

  // Her tab focus'ta verileri yeniden yükle (seans tamamlama sonrası güncel göster)
  useFocusEffect(loadData);

  const nextIncomplete = todaySessions.find((s) => !s.completed);
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleStartSession = () => {
    if (!nextIncomplete) {
      if (program) {
        navigation.navigate('FrequencyProgram', { program, userId });
      }
      return;
    }

    const [protocolId, sessionTime] = nextIncomplete.sessionKey.split('.');
    const protocol = FREQUENCY_PROTOCOLS.find((p) => p.protocolId === protocolId);
    const session = protocol?.sessions.find((s) => s.time === sessionTime);

    if (session) {
      navigation.navigate('Player', {
        session,
        userId,
        sessionKey: nextIncomplete.sessionKey,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Başlık & selamlama */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}! 👋</Text>
            <Text style={styles.date}>{DAY_LABELS[TODAY_KEY as WeekDay]}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* İlerleme özeti */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Bugünün İlerlemesi</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount} / {totalCount} seans tamamlandı
          </Text>
          <View style={styles.streakBox}>
            <Text style={styles.streakIcon}>🔥</Text>
            <View>
              <Text style={styles.streakLabel}>Ardışık günler</Text>
              <Text style={styles.streakValue}>{streak} gün</Text>
            </View>
          </View>
        </View>

        {/* Quick start */}
        {nextIncomplete ? (
          <TouchableOpacity style={styles.quickStartCard} onPress={handleStartSession}>
            <View style={styles.quickStartContent}>
              <Text style={styles.quickStartLabel}>Sıradaki Seans</Text>
              <Text style={styles.quickStartTitle}>{nextIncomplete.label}</Text>
              <Text style={styles.quickStartMeta}>
                {nextIncomplete.frequency} Hz · {nextIncomplete.durationMin} dk
              </Text>
            </View>
            <View style={styles.quickStartButton}>
              <Text style={styles.quickStartArrow}>▶</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✓</Text>
            <Text style={styles.completedText}>Bugün tüm seanslar tamamlandı!</Text>
            {program && (
              <TouchableOpacity
                style={styles.viewProgramBtn}
                onPress={() => navigation.navigate('FrequencyProgram', { program, userId })}
              >
                <Text style={styles.viewProgramText}>Programı Gör</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Bugünün seansları */}
        <Text style={styles.sessionsHeading}>Bugünün Seansları</Text>

        {todaySessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              {program ? 'Bu gün için seans planlanmamış.' : 'Program bulunamadı.'}
            </Text>
          </View>
        ) : (
          <FlatList
            scrollEnabled={false}
            data={todaySessions}
            keyExtractor={(item) => item.sessionKey}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.sessionRow, item.completed && styles.sessionRowDone]}
                onPress={() => {
                  if (!item.completed) {
                    const [pid, time] = item.sessionKey.split('.');
                    const protocol = FREQUENCY_PROTOCOLS.find((p) => p.protocolId === pid);
                    const session = protocol?.sessions.find((s) => s.time === time);
                    if (session) {
                      navigation.navigate('Player', { session, userId, sessionKey: item.sessionKey });
                    }
                  }
                }}
                disabled={item.completed}
              >
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionName, item.completed && styles.sessionNameDone]}>
                    {item.label}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {item.frequency} Hz · {item.durationMin} dk
                  </Text>
                </View>
                <View style={[styles.sessionStatus, item.completed && styles.sessionStatusDone]}>
                  <Text style={styles.statusIcon}>{item.completed ? '✓' : '○'}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>💡 İpucu</Text>
          <Text style={styles.infoText}>
            Seansları aynı saatlerde yapmak sonuçları iyileştirir.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.settingsLink}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsText}>Programımı Değiştir</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  greeting: { fontSize: 28, fontWeight: '800', color: '#1E293B' },
  date: { fontSize: 14, color: '#64748B', marginTop: 4 },
  profileBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  profileIcon: { fontSize: 20 },
  progressCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: '#475569' },
  progressPercent: { fontSize: 18, fontWeight: '800', color: '#4A90D9' },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#4A90D9', borderRadius: 3 },
  progressText: { fontSize: 13, color: '#64748B', marginBottom: 16 },
  streakBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
  },
  streakIcon: { fontSize: 24 },
  streakLabel: { fontSize: 11, color: '#92400E' },
  streakValue: { fontSize: 16, fontWeight: '800', color: '#92400E' },
  quickStartCard: {
    marginHorizontal: 16,
    backgroundColor: '#4A90D9',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quickStartContent: { flex: 1 },
  quickStartLabel: { fontSize: 12, color: '#93C5FD', fontWeight: '600' },
  quickStartTitle: { fontSize: 18, fontWeight: '800', color: '#FFF', marginTop: 4 },
  quickStartMeta: { fontSize: 13, color: '#DBEAFE', marginTop: 2 },
  quickStartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStartArrow: { color: '#FFF', fontSize: 16 },
  completedCard: {
    marginHorizontal: 16,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  completedIcon: { fontSize: 40, marginBottom: 8 },
  completedText: { fontSize: 14, fontWeight: '600', color: '#065F46', textAlign: 'center' },
  viewProgramBtn: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 8 },
  viewProgramText: { fontSize: 13, color: '#059669', fontWeight: '600' },
  sessionsHeading: { fontSize: 16, fontWeight: '700', color: '#1E293B', marginHorizontal: 16, marginBottom: 12 },
  emptyBox: { marginHorizontal: 16, padding: 24, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  sessionRow: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionRowDone: { opacity: 0.6 },
  sessionInfo: { flex: 1 },
  sessionName: { fontSize: 14, fontWeight: '600', color: '#1E293B' },
  sessionNameDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
  sessionMeta: { fontSize: 12, color: '#4A90D9', marginTop: 2 },
  sessionStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionStatusDone: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  statusIcon: { fontSize: 14, color: '#64748B' },
  infoBox: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#4A90D9',
  },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  infoText: { fontSize: 12, color: '#1E40AF', marginTop: 4, lineHeight: 18 },
  settingsLink: { marginHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  settingsText: { fontSize: 14, color: '#4A90D9', fontWeight: '600' },
});
