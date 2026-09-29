import AsyncStorage from '@react-native-async-storage/async-storage';

import { logError } from '@/lib/logger';

import type { Account, Session } from './AuthService';

/** État de session observable, partagé par les implémentations d'AuthService. */
export class SessionStore {
  private session: Session = { status: 'loading' };
  private readonly listeners = new Set<(session: Session) => void>();

  get(): Session {
    return this.session;
  }

  set(session: Session): void {
    this.session = session;
    for (const listener of this.listeners) listener(session);
  }

  subscribe(listener: (session: Session) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

const ACCOUNT_KEY = 'tutoria.account';

/**
 * Dernier compte lu, gardé sur l'appareil : l'app s'ouvre hors ligne sur le bon espace.
 * Effacé à la déconnexion et à la suppression du compte.
 */
export const accountCache = {
  async read(userId: string): Promise<Account | null> {
    try {
      const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
      const account = raw ? (JSON.parse(raw) as Account) : null;
      return account?.id === userId ? account : null;
    } catch (error) {
      logError('auth.cache', error);
      return null;
    }
  },
  async write(account: Account): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    } catch (error) {
      logError('auth.cache', error);
    }
  },
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACCOUNT_KEY);
    } catch (error) {
      logError('auth.cache', error);
    }
  },
};
