import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveUserId,
  getUserId,
  clearAllData,
  saveConsentDate,
  saveProgram,
  getProgram,
  markSessionComplete,
  getCompletionsForDate,
  isSessionCompletedToday,
  updateStreak,
  getStreak,
} from '../../modules/storage';
import type { UserProgram } from '../../shared/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const MOCK_PROGRAM: UserProgram = {
  userId: 'usr_abc',
  generatedAt: new Date().toISOString(),
  programDuration: 'medium',
  dominantDimensions: ['enerji'],
  scores: {
    enerji: 5, norolojik: 0, metabolik: 0, inflamasyon: 0,
    sindirim: 0, hormonal: 0, immun: 0, kardiyovaskuler: 0, biyorezonans: 0,
  },
  weeklyPlan: { monday: ['ENERGY_RESTORE.morning'] },
  notes: [],
};

beforeEach(() => {
  AsyncStorage.clear();
});

describe('userId', () => {
  it('userId kaydeder ve geri okur', async () => {
    await saveUserId('usr_test');
    expect(await getUserId()).toBe('usr_test');
  });

  it('kayıt yoksa null döner', async () => {
    expect(await getUserId()).toBeNull();
  });

  it('clearAllData userId siler', async () => {
    await saveUserId('usr_test');
    await clearAllData();
    expect(await getUserId()).toBeNull();
  });
});

describe('saveConsentDate', () => {
  it('tarih kaydeder', async () => {
    await saveConsentDate();
    const raw = await AsyncStorage.getItem('wellness:consentDate');
    expect(raw).not.toBeNull();
    expect(new Date(raw!).getTime()).not.toBeNaN();
  });
});

describe('program', () => {
  it('programı kaydeder ve parse ederek döner', async () => {
    await saveProgram(MOCK_PROGRAM);
    const loaded = await getProgram();
    expect(loaded?.userId).toBe('usr_abc');
    expect(loaded?.programDuration).toBe('medium');
  });

  it('kayıt yoksa null döner', async () => {
    expect(await getProgram()).toBeNull();
  });
});

describe('session completions', () => {
  it('seans tamamlamasını kaydeder', async () => {
    await markSessionComplete('ENERGY_RESTORE.morning', 360);
    const completions = await getCompletionsForDate();
    expect(completions).toHaveLength(1);
    expect(completions[0].sessionKey).toBe('ENERGY_RESTORE.morning');
  });

  it('birden fazla tamamlama birikir', async () => {
    await markSessionComplete('A.morning', 300);
    await markSessionComplete('B.evening', 600);
    const completions = await getCompletionsForDate();
    expect(completions).toHaveLength(2);
  });

  it('isSessionCompletedToday tamamlanan için true döner', async () => {
    await markSessionComplete('NEURO_BALANCE.night', 900);
    expect(await isSessionCompletedToday('NEURO_BALANCE.night')).toBe(true);
  });

  it('isSessionCompletedToday tamamlanmayan için false döner', async () => {
    expect(await isSessionCompletedToday('X.morning')).toBe(false);
  });
});

describe('streak', () => {
  it('ilk güncelleme streak'i 1 yapar', async () => {
    const streak = await updateStreak();
    expect(streak.count).toBe(1);
  });

  it('aynı gün tekrar çağrılırsa streak değişmez', async () => {
    await updateStreak();
    const streak = await updateStreak();
    expect(streak.count).toBe(1);
  });

  it('getStreak başlangıçta 0 döner', async () => {
    const streak = await getStreak();
    expect(streak.count).toBe(0);
  });
});
