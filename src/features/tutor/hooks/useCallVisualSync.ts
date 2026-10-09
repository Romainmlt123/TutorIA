import { useEffect, useState } from 'react';

import type { VoiceCaption } from '@/services/tutor';
import type { TutorVisual } from '@/services/tutor/visuals';

import { boardProgress, namedTone } from '../logic/voiceSync';

const TICK_MS = 400;

type Track = { visual: TutorVisual | null; ticks: number; heard: boolean };

/**
 * La voix et le visuel avancent ensemble (2D, 2F) : la courbe que le tuteur nomme passe au premier
 * plan, et le tableau s'écrit ligne à ligne pendant qu'il parle, en entier quand il a fini.
 */
export function useCallVisualSync(
  visual: TutorVisual | null,
  caption: VoiceCaption | null,
  speaking: boolean,
) {
  const [track, setTrack] = useState<Track>({ visual, ticks: 0, heard: false });
  // Nouveau visuel : le tableau repart de sa première ligne.
  if (track.visual !== visual) setTrack({ visual, ticks: 0, heard: false });
  else if (speaking && !track.heard) setTrack({ ...track, heard: true });

  const writing = visual?.kind === 'board' && speaking;
  useEffect(() => {
    if (!writing) return;
    const timer = setInterval(() => setTrack((t) => ({ ...t, ticks: t.ticks + 1 })), TICK_MS);
    return () => clearInterval(timer);
  }, [writing]);

  const focus = visual?.kind === 'graph' && caption ? namedTone(caption.text) : null;
  const progress =
    visual?.kind === 'board'
      ? boardProgress(visual.steps.length, track.ticks * TICK_MS, track.heard && !speaking)
      : undefined;
  return { focus, progress };
}
