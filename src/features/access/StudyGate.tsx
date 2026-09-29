import type { ReactNode } from 'react';

import { useStudyAccess } from '@/lib/session/useStudyRules';

import { ConsentLockedScreen } from './ConsentLockedScreen';
import { StudyPauseScreen } from './StudyPauseScreen';

type Props = {
  children: ReactNode;
  /** Le tuteur exige le consentement parental ; les flashcards, non. */
  requireConsent?: boolean;
};

/** Applique les réglages parentaux et le consentement avant le tuteur ou une séance de flashcards. */
export function StudyGate({ children, requireConsent = false }: Props) {
  const { consentPending, block, rules } = useStudyAccess();
  if (requireConsent && consentPending) return <ConsentLockedScreen />;
  if (block && rules) return <StudyPauseScreen block={block} rules={rules} />;
  return <>{children}</>;
}
