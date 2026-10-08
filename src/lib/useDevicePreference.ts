import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { logError } from './logger';

/**
 * Préférence retenue sur l'appareil (sous-titres de l'appel, sons et vibrations) : la valeur par
 * défaut d'abord, puis celle enregistrée dès qu'elle est lue.
 */
export function useDevicePreference(key: string, initial: boolean) {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((stored) => {
        if (!cancelled && stored !== null) setValue(stored === '1');
      })
      .catch((error: unknown) => logError('preference.read', error));
    return () => {
      cancelled = true;
    };
  }, [key]);

  const update = (next: boolean) => {
    setValue(next);
    AsyncStorage.setItem(key, next ? '1' : '0').catch((error: unknown) =>
      logError('preference.save', error),
    );
  };

  return [value, update] as const;
}
