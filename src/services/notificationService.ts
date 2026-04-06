/**
 * Cross-platform local notification service.
 *
 * Uses @notifee/react-native which works on both iOS and Android.
 * On iOS it also handles permission requests.
 */

import notifee, {AndroidImportance, AndroidVisibility, AuthorizationStatus} from '@notifee/react-native';

const CHANNEL_ID = 'gym-tracker-timer';
const NOTIFICATION_ID = 'rest-timer';

async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Rest Timer',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'default',
    vibration: true,
  });
}

/** Request permission (iOS) and create the notification channel (Android). */
async function bootstrap(): Promise<void> {
  const settings = await notifee.requestPermission();
  if (settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED) {
    await ensureChannel();
  }
}

/** Schedule a "Rest Over!" notification after `seconds` seconds. */
async function scheduleRestNotification(seconds: number): Promise<void> {
  await cancelRestNotification();
  await ensureChannel();

  // Notifee trigger-based scheduling
  const {TimestampTrigger, TriggerType} = await import('@notifee/react-native');
  const trigger: import('@notifee/react-native').TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: Date.now() + seconds * 1000,
  };

  await notifee.createTriggerNotification(
    {
      id: NOTIFICATION_ID,
      title: 'Rest Over! 💪',
      body: 'Time for your next set.',
      android: {channelId: CHANNEL_ID, importance: AndroidImportance.HIGH},
    },
    trigger,
  );
}

/** Cancel any pending rest notification. */
async function cancelRestNotification(): Promise<void> {
  await notifee.cancelNotification(NOTIFICATION_ID);
}

export const notificationService = {
  bootstrap,
  scheduleRestNotification,
  cancelRestNotification,
};
