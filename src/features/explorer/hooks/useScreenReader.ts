import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { logError } from '@/lib/logger';

/**
 * Vrai quand un lecteur d'écran (TalkBack, VoiceOver) est actif : l'interface passe en liste. Sur le
 * web, React Native Web répond toujours « oui » : la détection n'y est donc pas utilisable.
 */
export function useScreenReader(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let cancelled = false;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => {
        if (!cancelled) setEnabled(value);
      })
      .catch((error: unknown) => logError('explorer.screenReader', error));
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);
  return enabled;
}
