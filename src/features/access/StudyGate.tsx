import type { ReactNode } from 'react';

import { useStudyAccess } from '@/lib/session/useStudyRules';
import type { StudyRules } from '@/services/student';
import type { StudyBlock } from '@/services/student/studyRules';

import { ConsentLockedScreen } from './ConsentLockedScreen';
import { StudyPauseScreen } from './StudyPauseScreen';

type Props = {
  children: ReactNode;
  /** Le tuteur exige le consentement parental ; les flashcards, non. */
  requireConsent?: boolean;
  /** La session de flashcards est plein écran : la pause n'y laisse pas de place à la barre. */
  withNav?: boolean;
  /** Pause propre à l'écran (le niveau d'Explorer reste dans le jeu, R6) à la place de R1 à R3. */
  pause?: (block: StudyBlock, rules: StudyRules) => ReactNode;
};

/** Applique les réglages parentaux et le consentement avant le tuteur ou une séance de flashcards. */
export function StudyGate({ children, requireConsent = false, withNav = true, pause }: Props) {
  const { consentPending, block, rules } = useStudyAccess();
  if (requireConsent && consentPending) return <ConsentLockedScreen />;
  if (block && rules) {
    return pause ? (
      pause(block, rules)
    ) : (
      <StudyPauseScreen block={block} rules={rules} withNav={withNav} />
    );
  }
  return <>{children}</>;
}
