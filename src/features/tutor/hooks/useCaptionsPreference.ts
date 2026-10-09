import { useDevicePreference } from '@/lib/useDevicePreference';

/** Clé des sous-titres de l'appel, partagée avec le profil (Préférences). */
export const CAPTIONS_KEY = 'tutoria.voice.captions';

/**
 * Sous-titres de l'appel vocal (v2.6) : affichés par défaut, et le choix de l'élève est retenu
 * sur l'appareil pour les appels suivants.
 */
export function useCaptionsPreference() {
  const [captionsOn, setCaptionsOn] = useDevicePreference(CAPTIONS_KEY, true);
  return { captionsOn, setCaptionsOn, toggleCaptions: () => setCaptionsOn(!captionsOn) };
}
