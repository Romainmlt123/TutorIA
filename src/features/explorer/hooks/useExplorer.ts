import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { LevelRecord } from '@/features/explorer/logic/progression';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import { levelOf } from '@/lib/xpLevel';
import { explorerService } from '@/services/explorer';

import { ISLANDS } from '../content';
import { islandSlides } from '../logic/islands';

export const explorerKeys = { records: ['explorer', 'records'] as const };

const NO_RECORDS: readonly LevelRecord[] = [];

/** Données de l'onglet Explorer (X1) : l'élève, sa série, son niveau et ses îles. */
export function useExplorer() {
  const account = useStudentAccount();
  const overview = useStudentOverview();
  const query = useQuery({
    queryKey: explorerKeys.records,
    queryFn: () => explorerService.levelRecords(),
  });
  const records = query.data ?? NO_RECORDS;
  const slides = useMemo(() => islandSlides(ISLANDS, records), [records]);
  return {
    firstName: account?.firstName ?? '',
    streakDays: overview.streakDays,
    ...levelOf(overview.xp),
    slides,
  };
}
