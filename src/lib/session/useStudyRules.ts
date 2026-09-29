import { useQuery } from '@tanstack/react-query';

import { studentDataService, type StudyRules } from '@/services/student';
import { studyBlock, type StudyBlock } from '@/services/student/studyRules';

import { useStudentAccount } from './SessionProvider';

export const studyRulesKey = ['student', 'rules'] as const;

/** Réglages parentaux de l'élève connecté (relus toutes les minutes pour la limite du jour). */
export function useStudyRules() {
  const student = useStudentAccount();
  return useQuery({
    queryKey: studyRulesKey,
    queryFn: () => studentDataService.rules(),
    enabled: Boolean(student),
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
}

export type StudyAccess = {
  rules: StudyRules | undefined;
  /** Moins de 15 ans sans validation d'un parent : le tuteur est bloqué. */
  consentPending: boolean;
  block: StudyBlock | null;
};

export function useStudyAccess(now = new Date()): StudyAccess {
  const student = useStudentAccount();
  const { data: rules } = useStudyRules();
  return {
    rules,
    consentPending: student?.consentStatus === 'pending',
    block: rules ? studyBlock(rules, rules.todaySeconds, now) : null,
  };
}
