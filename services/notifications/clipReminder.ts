/**
 * Clip Expiry Reminder — schedules local push notifications
 * on day 10 to warn users their audio clips will be deleted.
 *
 * Uses expo-notifications for local scheduling.
 * Notifications are scheduled when a recording session ends with kept clips.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CLIP_EXPIRY_DAYS = 10;
const NOTIFICATION_CHANNEL_ID = 'clip-reminders';

/** Request notification permissions. Call once at app startup. */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Configure notification handler and channel (call once at app startup). */
export function configureNotifications(): void {
  // Handle notifications when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Android notification channel
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'Clip Reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      description: 'Reminders before your audio clips expire',
    }).catch(() => {});
  }
}

/**
 * Schedule a local notification for day 10 after a session.
 * Reminds the user to export their audio clips before auto-deletion.
 *
 * @param sessionDate - The date the session was recorded (ISO string or YYYY-MM-DD)
 * @param sessionId - The session ID (used as notification identifier for cancellation)
 * @param clipCount - Number of audio clip segments kept
 */
export async function scheduleClipExpiryReminder(
  sessionDate: string,
  sessionId: string,
  clipCount: number,
): Promise<string | null> {
  if (clipCount <= 0) return null;

  try {
    // Fire 1 day before expiry (day 9) at 9 AM so "expiring tomorrow" is accurate
    const date = new Date(sessionDate.split('T')[0]);
    date.setDate(date.getDate() + CLIP_EXPIRY_DAYS - 1);
    date.setHours(9, 0, 0, 0);

    // Don't schedule if the reminder date is in the past
    if (date.getTime() <= Date.now()) return null;

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Audio clips expiring tomorrow',
        body: `You have ${clipCount} audio clip${clipCount !== 1 ? 's' : ''} from your sleep session that will be permanently deleted tomorrow. Open MyDriftLAB to export them.`,
        data: { type: 'clip-expiry', sessionId },
        ...(Platform.OS === 'android' && {
          channelId: NOTIFICATION_CHANNEL_ID,
        }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
      },
      identifier: `clip-expiry-${sessionId}`,
    });

    return notificationId;
  } catch {
    return null;
  }
}

/**
 * Cancel a previously scheduled clip expiry reminder.
 * Call this when the user exports all clips for a session.
 */
export async function cancelClipExpiryReminder(
  sessionId: string,
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      `clip-expiry-${sessionId}`,
    );
  } catch {
    // Best effort
  }
}

/** Cancel all scheduled clip expiry reminders. */
export async function cancelAllClipReminders(): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.identifier.startsWith('clip-expiry-')) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier,
        ).catch(() => {});
      }
    }
  } catch {
    // Best effort
  }
}
