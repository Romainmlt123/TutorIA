import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { logError } from './logger';

const KEY = 'tutoria.clientId';
let pending: Promise<string> | null = null;

/**
 * Identifiant anonyme de l'installation (UUID), utilisé par le serveur pour limiter le débit.
 * Aucune donnée personnelle. À remplacer par une vraie authentification.
 */
export function getClientId(): Promise<string> {
  pending ??= (async () => {
    try {
      const stored = await AsyncStorage.getItem(KEY);
      if (stored) return stored;
      const id = Crypto.randomUUID();
      await AsyncStorage.setItem(KEY, id);
      return id;
    } catch (error) {
      logError('clientId', error);
      return Crypto.randomUUID();
    }
  })();
  return pending;
}
