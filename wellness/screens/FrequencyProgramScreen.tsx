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
import type { WeekDay } from '../shared/types';
import { FREQUENCY_PROTOCOLS } from '../modules/clinical-dashboard/frequency-catalog';
import { logAction } from '../modules/audit-logger';

type Props = NativeStackScreenProps<RootStackParamList, 'FrequencyProgram'>;

const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Pzt',
  tuesday: 'Sal',
  wednesday: 'Çar',
  thursday: 'Per',
  friday: 'Cum',
  saturday: 'Cmt',
  sunday: 'Paz',
};

const TODAY_INDEX = new Date().getDay();
const DAYS: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const TODAY_KEY = DAYS[TODAY_INDEX];

/**
 * Haftalık frekans programı ekranı.
 * Günlük seansları listeler, her seans için Player'a geçiş sağlar.
 */
export default function FrequencyProgramScreen({ navigation, route }: Props) {
  const { program, userId } = route.params;
  const [selectedDay, setSelectedDay] = useState<WeekDay>(TODAY_KEY);
  const [completedSessions, setCompletedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    logAction(userId, 'VERI_GORUNTULEME', 'FrequencyProgramScreen', 'SUCCESS');
  }, [userId]);

  const daySessions = program.weeklyPlan[selectedDay] ?? [];

  function resolveSession(sessionKey: string) {
    const [protocolId, sessionTime] = sessionKey.split('.');
    const protocol = FREQUENCY_PROTOCOLS.find((p) => p.protocolId === protocolId);
    const session = protocol?.sessions.find((s) => s.time === sessionTime);
    return session ? { session, protocolId } : null;
  }

  function toggleComplete(key: string) {
    setCompletedSessions((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Haftalık takvim */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.calendarRow}
        contentContainerStyle={styles.calendarContent}
      >
        {(Object.keys(DAY_LABELS) as WeekDay[]).map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayBtn, selectedDay === day && styles.dayBtnActive]}
            onPress={() => setSelectedDay(day)}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
              {DAY_LABELS[day]}
            </Text>
            {day === TODAY_KEY && <View style={styles.todayDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>
          {DAY_LABELS[selectedDay]} — {daySessions.length} Seans
        </Text>

        {daySessions.length === 0 && (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Bu gün için seans planlanmamış.</Text>
          </View>
        )}

        {daySessions.map((key) => {
          const resolved = resolveSession(key);
          if (!resolved) return null;
          const { session } = resolved;
          const done = completedSessions.has(key);

          return (
            <View key={key} style={[styles.sessionCard, done && styles.sessionCardDone]}>
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionLabel}>{session.label}</Text>
                <Text style={styles.sessionMeta}>
                  {session.frequency} Hz · {session.durationMin} dk · {session.type}
                </Text>
                <Text style={styles.sessionNote}>{session.notes}</Text>
              </View>
              <View style={styles.sessionActions}>
                <TouchableOpacity
                  style={styles.playBtn}
                  onPress={() =>
                    navigation.navigate('Player', { session, userId, sessionKey: key })
                  }
                >
                  <Text style={styles.playBtnText}>▶</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.doneBtn, done && styles.doneBtnActive]}
                  onPress={() => toggleComplete(key)}
                >
                  <Text style={styles.doneBtnText}>{done ? '✓' : '○'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  calendarRow: { maxHeight: 72, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  calendarContent: { paddingHorizontal: 12, paddingVertical: 12, gap: 8, flexDirection: 'row' },
  dayBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  dayBtnActive: { backgroundColor: '#4A90D9' },
  dayText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  dayTextActive: { color: '#FFF' },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 2,
  },
  content: { padding: 16, gap: 12 },
  heading: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  emptyBox: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  sessionCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionCardDone: { opacity: 0.55 },
  sessionInfo: { flex: 1 },
  sessionLabel: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  sessionMeta: { fontSize: 12, color: '#4A90D9', marginTop: 2, fontWeight: '600' },
  sessionNote: { fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 16 },
  sessionActions: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  playBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#4A90D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: { color: '#FFF', fontSize: 14 },
  doneBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doneBtnActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  doneBtnText: { fontSize: 16, color: '#64748B' },
});
