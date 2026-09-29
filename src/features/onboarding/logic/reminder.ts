import { logError } from '@/lib/logger';

/**
 * Demande la permission des notifications, seulement quand l'élève active le rappel (O4).
 * Aucune notification n'est planifiée à cette étape. Le module est chargé à la demande :
 * Expo Go ne fournit plus les notifications sur Android et le signale au chargement.
 */
export async function requestReminderPermission(): Promise<boolean> {
  try {
    const Notifications = await import('expo-notifications');
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (!current.canAskAgain) return false;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    logError('reminder.permission', error);
    return false;
  }
}
