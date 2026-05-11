import {
  requestNotificationPermission,
  cancelAllNotifications,
  scheduleSessionReminders,
  scheduleStreakReminder,
} from '../../modules/notifications';
import type { UserProgram } from '../../shared/types';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  cancelAllScheduledNotificationsAsync: jest.fn().mockResolvedValue(undefined),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-id'),
  setNotificationHandler: jest.fn(),
  SchedulableTriggerInputTypes: {
    WEEKLY: 'weekly',
    DAILY: 'daily',
  },
}));

const MOCK_PROGRAM: UserProgram = {
  userId: 'usr_test',
  generatedAt: new Date().toISOString(),
  programDuration: 'short',
  dominantDimensions: ['enerji'],
  scores: {
    enerji: 5, norolojik: 0, metabolik: 0, inflamasyon: 0,
    sindirim: 0, hormonal: 0, immun: 0, kardiyovaskuler: 0, biyorezonans: 0,
  },
  weeklyPlan: {
    monday: ['ENERGY_RESTORE.morning'],
    tuesday: ['NEURO_BALANCE.night'],
  },
  notes: [],
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Notifications = require('expo-notifications');

beforeEach(() => jest.clearAllMocks());

describe('requestNotificationPermission', () => {
  it('izin zaten verilmişse true döner', async () => {
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
  });

  it('izin reddedilirse false döner', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });
});

describe('cancelAllNotifications', () => {
  it('cancelAllScheduledNotificationsAsync çağrılır', async () => {
    await cancelAllNotifications();
    expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  });
});

describe('scheduleSessionReminders', () => {
  it('her sessionKey için scheduleNotificationAsync çağrılır', async () => {
    await scheduleSessionReminders(MOCK_PROGRAM);
    // monday 1 session + tuesday 1 session = 2 çağrı
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
  });

  it('izin yoksa bildirim zamanlanmaz', async () => {
    Notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    Notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    await scheduleSessionReminders(MOCK_PROGRAM);
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('scheduleStreakReminder', () => {
  it('streak bildirimi zamanlanır', async () => {
    await scheduleStreakReminder();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    const callArg = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(callArg.content.title).toContain('Streak');
  });
});
