import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

import { logError } from '@/lib/logger';

/*
 * Interrupteur du compteur de performance (développement seulement) : allumé dans l'atelier
 * d'Explorer, lu par l'onglet Explorer resté monté dessous, et retenu sur l'appareil. Une seule
 * valeur pour toute l'app, sans toucher aux préférences de l'élève (`useDevicePreference`).
 */

/** Clé de l'appareil où l'interrupteur est retenu. */
export const PERF_HUD_KEY = 'dev.perfHud';

let on = false;
/** Lu une seule fois, au premier abonné. */
let readStarted = false;
/** Un choix fait avant la fin de cette lecture l'emporte sur la valeur lue. */
let chosen = false;
const listeners = new Set<() => void>();

function apply(next: boolean) {
  on = next;
  listeners.forEach((listener) => listener());
}

export function subscribePerfHud(listener: () => void): () => void {
  listeners.add(listener);
  if (!readStarted) {
    readStarted = true;
    AsyncStorage.getItem(PERF_HUD_KEY)
      .then((stored) => {
        if (!chosen && stored !== null) apply(stored === '1');
      })
      .catch((error: unknown) => logError('perfHud.read', error));
  }
  return () => {
    listeners.delete(listener);
  };
}

export function getPerfHud(): boolean {
  return on;
}

/** Allume ou éteint le compteur (atelier), et le retient sur l'appareil. */
export function setPerfHud(next: boolean) {
  chosen = true;
  apply(next);
  AsyncStorage.setItem(PERF_HUD_KEY, next ? '1' : '0').catch((error: unknown) =>
    logError('perfHud.save', error),
  );
}

const never = () => false;

function usePerfHudFlag(): boolean {
  return useSyncExternalStore(subscribePerfHud, getPerfHud, never);
}

/** Vrai si le compteur est demandé ; toujours faux en production, sans même lire le stockage. */
export const usePerfHud: () => boolean = __DEV__ ? usePerfHudFlag : never;
