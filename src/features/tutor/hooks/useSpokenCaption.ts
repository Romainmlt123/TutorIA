import { useEffect, useRef, useState } from 'react';

import type { VoiceCaption } from '@/services/tutor';

import { DEFAULT_SPEECH_CPS, measuredSpeechRate, spokenLength } from '../logic/voiceSync';

const TICK_MS = 100;
/** Début de phrase qui identifie une réponse du tuteur (une nouvelle réponse repart de zéro). */
const KEY_LENGTH = 12;

type Track = { key: string; elapsed: number; done: boolean };

/**
 * Sous-titres du tuteur calés sur sa voix (v2.6) : le texte de sa réponse arrive bien avant
 * l'audio, alors seuls les mots déjà prononcés s'allument, au débit de sa voix. Ce débit est
 * mesuré sur les réponses entendues en entier. Rend le nombre de caractères prononcés, ou
 * undefined pour les sous-titres de l'élève (affichés en entier).
 */
export function useSpokenCaption(caption: VoiceCaption | null, speaking: boolean) {
  const rate = useRef(DEFAULT_SPEECH_CPS);
  const tutorText = caption?.speaker === 'tutor' ? caption.text : '';
  const key = tutorText.slice(0, KEY_LENGTH);
  const [track, setTrack] = useState<Track>({ key, elapsed: 0, done: false });

  // Le début de phrase s'allonge pendant que la réponse arrive : c'est la même réponse. Sinon, une
  // nouvelle réponse commence, pas encore dite. Quand la voix s'arrête, tout est dit.
  const sameResponse = key.startsWith(track.key) || track.key.startsWith(key);
  if (key && !sameResponse) setTrack({ key, elapsed: 0, done: false });
  else if (key.length > track.key.length) setTrack({ ...track, key });
  else if (!speaking && track.elapsed > 0 && !track.done) setTrack({ ...track, done: true });

  useEffect(() => {
    if (!speaking) return;
    const timer = setInterval(
      () => setTrack((t) => (t.done ? t : { ...t, elapsed: t.elapsed + TICK_MS })),
      TICK_MS,
    );
    return () => clearInterval(timer);
  }, [speaking]);

  // Réponse entendue en entier : son débit sert pour les suivantes.
  const final = caption?.speaker === 'tutor' && caption.final;
  useEffect(() => {
    if (!track.done || !final) return;
    rate.current = measuredSpeechRate(tutorText.length, track.elapsed) ?? rate.current;
    // Mesure une seule fois, à la fin de chaque réponse.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.done]);

  if (!tutorText) return undefined;
  // eslint-disable-next-line react-hooks/refs -- débit lu au rendu, mis à jour hors rendu
  return track.done ? tutorText.length : spokenLength(tutorText, track.elapsed, rate.current);
}
