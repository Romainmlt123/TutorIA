import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { SubjectId } from '@/data/types';
import { explorerService } from '@/services/explorer';

import { islandOf } from '../content';
import type { LevelRecord } from '../logic/progression';
import { buildRegionMap, type RegionMap } from '../logic/regionMap';
import { explorerKeys } from './useExplorer';

const NO_RECORDS: readonly LevelRecord[] = [];

/** Carte de la région ouverte (X2b), recalculée quand les résultats de l'élève changent. */
export function useRegionMap(subjectId: SubjectId, regionId: string | null): RegionMap | null {
  const query = useQuery({
    queryKey: explorerKeys.records,
    queryFn: () => explorerService.levelRecords(),
  });
  const records = query.data ?? NO_RECORDS;
  return useMemo(() => {
    const island = islandOf(subjectId);
    if (!island || !regionId) return null;
    return buildRegionMap(island, regionId, new Map(records.map((r) => [r.levelId, r])));
  }, [subjectId, regionId, records]);
}
