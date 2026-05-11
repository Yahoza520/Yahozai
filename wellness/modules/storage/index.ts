import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProgram } from '../../shared/types';

const KEYS = {
  USER_ID: 'wellness:userId',
  PROGRAM: 'wellness:program',
  SESSION_COMPLETIONS: 'wellness:sessionCompletions',
  STREAK: 'wellness:streak',
  CONSENT_DATE: 'wellness:consentDate',
} as const;

export interface SessionCompletion {
  sessionKey: string;
  completedAt: string;
  durationSec: number;
}

export interface StreakData {
  lastCompletedDate: string;
  count: number;
}

// ─── User ──────────────────────────────────────────────────────────────────────

/**
 * Anonim userId'yi kalıcı olarak kaydeder.
 */
export async function saveUserId(userId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_ID, userId);
}

/**
 * Kayıtlı userId'yi döner; kayıtlı değilse null.
 */
export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.USER_ID);
}

/**
 * KVKK geri çekme — tüm kullanıcı verisini siler.
 */
export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

// ─── Consent ───────────────────────────────────────────────────────────────────

/**
 * Onay tarihini ISO 8601 formatında kaydeder.
 */
export async function saveConsentDate(): Promise<void> {
  await AsyncStorage.setItem(KEYS.CONSENT_DATE, new Date().toISOString());
}

// ─── Program ──────────────────────────────────────────────────────────────────

/**
 * Kullanıcı programını JSON olarak kaydeder.
 */
export async function saveProgram(program: UserProgram): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROGRAM, JSON.stringify(program));
}

/**
 * Kayıtlı programı parse ederek döner; yoksa null.
 */
export async function getProgram(): Promise<UserProgram | null> {
  const raw = await AsyncStorage.getItem(KEYS.PROGRAM);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as UserProgram;
  } catch {
    return null;
  }
}

// ─── Session Completions ──────────────────────────────────────────────────────

/**
 * Belirli bir tarihin tamamlanan seanslarını döner. (default: bugün)
 */
export async function getCompletionsForDate(
  dateStr?: string,
): Promise<SessionCompletion[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSION_COMPLETIONS);
  if (!raw) return [];
  try {
    const all: SessionCompletion[] = JSON.parse(raw);
    const target = dateStr ?? new Date().toISOString().slice(0, 10);
    return all.filter((c) => c.completedAt.startsWith(target));
  } catch {
    return [];
  }
}

/**
 * Bir seans tamamlamasını kayıt listesine ekler.
 */
export async function markSessionComplete(
  sessionKey: string,
  durationSec: number,
): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.SESSION_COMPLETIONS);
  const all: SessionCompletion[] = raw ? JSON.parse(raw) : [];
  all.push({ sessionKey, completedAt: new Date().toISOString(), durationSec });
  await AsyncStorage.setItem(KEYS.SESSION_COMPLETIONS, JSON.stringify(all));
}

/**
 * sessionKey'in bugün tamamlanıp tamamlanmadığını kontrol eder.
 */
export async function isSessionCompletedToday(
  sessionKey: string,
): Promise<boolean> {
  const todayCompletions = await getCompletionsForDate();
  return todayCompletions.some((c) => c.sessionKey === sessionKey);
}

// ─── Streak ───────────────────────────────────────────────────────────────────

/**
 * Bugün en az bir seans tamamlandığında streak'i günceller.
 */
export async function updateStreak(): Promise<StreakData> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  const streak: StreakData = raw
    ? JSON.parse(raw)
    : { lastCompletedDate: '', count: 0 };

  if (streak.lastCompletedDate === today) {
    return streak;
  }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const newStreak: StreakData = {
    lastCompletedDate: today,
    count: streak.lastCompletedDate === yesterday ? streak.count + 1 : 1,
  };

  await AsyncStorage.setItem(KEYS.STREAK, JSON.stringify(newStreak));
  return newStreak;
}

/**
 * Mevcut streak verisini döner.
 */
export async function getStreak(): Promise<StreakData> {
  const raw = await AsyncStorage.getItem(KEYS.STREAK);
  return raw ? JSON.parse(raw) : { lastCompletedDate: '', count: 0 };
}
