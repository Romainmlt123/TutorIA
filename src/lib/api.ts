import { Platform } from 'react-native';

import { config } from './config';

/**
 * URL absolue d'une route du serveur intermédiaire.
 * Web : chemin relatif. Mobile : origine du serveur de développement (tunnel compris)
 * ou `origin` d'Expo Router en production, exposée par `window.location`.
 */
export function apiUrl(path: string): string {
  if (config.apiBaseUrl) return `${config.apiBaseUrl}${path}`;
  if (Platform.OS === 'web') return path;
  const origin = globalThis.location?.origin;
  if (!origin) throw new Error('Adresse du serveur intermédiaire inconnue');
  return new URL(path, origin).toString();
}
