import { useEffect } from 'react';

import { preloadAvatar } from '../avatar3d/Avatar3D';
import { useAvatarLook } from './useAvatarLook';

/**
 * Prépare l'avatar dès l'Accueil : l'apparence est lue en base et la figurine 3D (1,6 Mo) est
 * chargée en mémoire, pour qu'elle apparaisse aussitôt sur le profil, la carte ou l'éditeur.
 * Sans avatar, rien n'est chargé.
 */
export function usePreloadAvatar() {
  const look = useAvatarLook();
  const hasAvatar = Boolean(look.data);
  useEffect(() => {
    if (hasAvatar) preloadAvatar();
  }, [hasAvatar]);
}
