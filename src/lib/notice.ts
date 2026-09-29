import { useSyncExternalStore } from 'react';

/**
 * Message bref affiché par-dessus l'écran (NoticeToast) : code parent relié, invitation envoyée…
 * Il survit aux changements d'espace, contrairement à l'état d'un écran.
 */
let current: string | null = null;
const listeners = new Set<() => void>();

export function showNotice(message: string): void {
  current = message;
  for (const listener of listeners) listener();
}

export function dismissNotice(): void {
  current = null;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useNotice(): string | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
