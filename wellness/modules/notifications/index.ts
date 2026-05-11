import * as Notifications from 'expo-notifications';
import type { UserProgram, WeekDay } from '../../shared/types';

const WEEK_DAYS: WeekDay[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

// Seans zamanlarına karşılık gelen saat değerleri
const SESSION_HOURS: Record<string, number> = {
  morning: 8,
  midday: 12,
  afternoon: 15,
  pre_meal: 12,
  evening: 19,
  night: 22,
};

/**
 * Bildirim izni ister. 'granted' ise true döner.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Tüm zamanlanmış bildirimleri iptal eder.
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Programa göre haftalık seans hatırlatıcılarını zamanlar.
 * Önceki tüm bildirimler önce iptal edilir.
 */
export async function scheduleSessionReminders(
  program: UserProgram,
): Promise<void> {
  const permitted = await requestNotificationPermission();
  if (!permitted) return;

  await cancelAllNotifications();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  for (const [dayKey, sessionKeys] of Object.entries(program.weeklyPlan)) {
    const dayIndex = WEEK_DAYS.indexOf(dayKey as WeekDay);
    if (dayIndex === -1) continue;

    for (const sessionKey of sessionKeys) {
      const [, timeKey] = sessionKey.split('.');
      const hour = SESSION_HOURS[timeKey];
      if (hour === undefined) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Wellness — Seans Zamanı',
          body: `${timeKey.charAt(0).toUpperCase() + timeKey.slice(1)} seansınız başlamak üzere.`,
          data: { sessionKey },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: dayIndex + 1, // expo: 1=Pazar, 7=Cumartesi
          hour,
          minute: 0,
        },
      });
    }
  }
}

/**
 * Streak kırılma uyarısı — bugün hiç seans yapılmadıysa akşam 21:00'de gönderilir.
 */
export async function scheduleStreakReminder(): Promise<void> {
  const permitted = await requestNotificationPermission();
  if (!permitted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Wellness — Streaki Koruyun! 🔥',
      body: 'Bugün henüz seans yapmadınız. Streaki kırmamak için şimdi başlayın.',
      data: { type: 'streak_warning' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}
