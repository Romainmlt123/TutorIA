import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { useSyncExternalStore } from 'react';

import { logError } from '@/lib/logger';

export const SOUNDS_KEY = 'tutoria.sounds';

let enabled = true;
let writeVersion = 0;
const listeners = new Set<() => void>();

function canUseStorage(): boolean {
  return Platform.OS !== 'web' || typeof window !== 'undefined';
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

if (canUseStorage()) {
  void AsyncStorage.getItem(SOUNDS_KEY)
    .then((stored) => {
      if (writeVersion > 0 || (stored !== '0' && stored !== '1')) return;
      enabled = stored === '1';
      notify();
    })
    .catch((error: unknown) => logError('feedback.preference.read', error));
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function soundsEnabled(): boolean {
  return enabled;
}

export function setSoundsPreference(next: boolean): void {
  writeVersion += 1;
  enabled = next;
  notify();
  if (!canUseStorage()) return;
  AsyncStorage.setItem(SOUNDS_KEY, next ? '1' : '0').catch((error: unknown) =>
    logError('feedback.preference.save', error),
  );
}

export function useSoundsPreference(): readonly [boolean, (next: boolean) => void] {
  const value = useSyncExternalStore(subscribe, soundsEnabled, soundsEnabled);
  return [value, setSoundsPreference] as const;
}
