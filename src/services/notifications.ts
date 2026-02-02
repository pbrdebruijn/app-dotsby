import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export async function scheduleNapReminder(
  napTime: Date,
  babyName: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Schedule 15 minutes before nap time
  const reminderTime = new Date(napTime);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15);

  // Don't schedule if reminder time is in the past
  if (reminderTime <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nap Time Approaching',
      body: `${babyName}'s wake window is ending in 15 minutes`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
    },
  });

  return id;
}

export async function scheduleFeedingReminder(
  reminderTime: Date,
  babyName: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Don't schedule if reminder time is in the past
  if (reminderTime <= new Date()) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Feeding Reminder',
      body: `Time to feed ${babyName}`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderTime,
    },
  });

  return id;
}

export async function scheduleMonthlyPhotoReminder(
  babyBirthDate: Date,
  babyName: string
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Calculate next month birthday
  const today = new Date();
  const nextMonthBirthday = new Date(babyBirthDate);

  while (nextMonthBirthday <= today) {
    nextMonthBirthday.setMonth(nextMonthBirthday.getMonth() + 1);
  }

  // Set reminder for 10 AM on that day
  nextMonthBirthday.setHours(10, 0, 0, 0);

  // Calculate months old
  const monthsOld = Math.round(
    (nextMonthBirthday.getTime() - babyBirthDate.getTime()) / (30.44 * 24 * 60 * 60 * 1000)
  );

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Monthly Photo Day!',
      body: `${babyName} is ${monthsOld} months old today!`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextMonthBirthday,
    },
  });

  return id;
}

export async function cancelNotification(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return Notifications.getAllScheduledNotificationsAsync();
}
