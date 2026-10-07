import { useState } from 'react';

import type { TutorVisual } from '@/services/tutor/visuals';

/**
 * Panneau du dernier visuel (replié ou ouvert) et visuel montré en plein écran.
 * - Le panneau n'est replié que pour le visuel que l'élève a replié : un nouveau visuel le rouvre.
 * - Pendant que l'élève écrit (`typing`), il se replie pour laisser voir la discussion, mais
 *   l'élève peut le rouvrir en touchant le bandeau.
 */
export function useVisualViewer(latest: TutorVisual | null, typing = false) {
  const [collapsedFor, setCollapsedFor] = useState<TutorVisual | null>(null);
  const [openedWhileTyping, setOpenedWhileTyping] = useState<TutorVisual | null>(null);
  const [expanded, setExpanded] = useState<TutorVisual | null>(null);
  const open =
    latest !== null && latest !== collapsedFor && (!typing || openedWhileTyping === latest);
  return {
    open,
    toggle: () => {
      if (open) {
        setCollapsedFor(latest);
        setOpenedWhileTyping(null);
      } else {
        setCollapsedFor(null);
        if (typing) setOpenedWhileTyping(latest);
      }
    },
    expanded,
    expand: (visual: TutorVisual) => setExpanded(visual),
    close: () => setExpanded(null),
  };
}
