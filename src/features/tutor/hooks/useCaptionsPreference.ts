import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import { logError } from '@/lib/logger';

const KEY = 'tutoria.voice.captions';

/**
 * Sous-titres de l'appel vocal (v2.6) : affichés par défaut, et le choix de l'élève est retenu
 * sur l'appareil pour les appels suivants.
 */
export function useCaptionsPreference() {
  const [captionsOn, setCaptionsOn] = useState(true);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(KEY)
      .then((stored) => {
        if (!cancelled && stored !== null) setCaptionsOn(stored === '1');
      })
      .catch((error: unknown) => logError('voice.captionsRead', error));
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCaptions = () => {
    const next = !captionsOn;
    setCaptionsOn(next);
    AsyncStorage.setItem(KEY, next ? '1' : '0').catch((error: unknown) =>
      logError('voice.captionsSave', error),
    );
  };

  return { captionsOn, toggleCaptions };
}
