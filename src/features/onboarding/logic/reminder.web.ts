import { logError } from '@/lib/logger';

/** Web : permission du navigateur, demandée seulement quand l'élève active le rappel. */
export async function requestReminderPermission(): Promise<boolean> {
  if (typeof Notification === 'undefined') return false;
  try {
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    return (await Notification.requestPermission()) === 'granted';
  } catch (error) {
    logError('reminder.permission', error);
    return false;
  }
}
