import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import type { SubjectId } from '@/data/types';
import { explorerService } from '@/services/explorer';

import { islandOf, type Region } from '../content';
import { regionSummary, type LevelRecord, type RegionSummary } from '../logic/progression';
import { explorerKeys } from './useExplorer';
import { useRegionsSeen } from './useRegionsSeen';

export type IslandRegion = RegionSummary & {
  region: Region;
  /** Rang de la région sur l'île (1, 2, 3), ou null pour l'îlot. */
  number: number | null;
};

const NO_RECORDS: readonly LevelRecord[] = [];

/** Régions d'une île avec leur progression (panneaux de X2a), et les régions déjà visitées. */
export function useIslandRegions(subjectId: SubjectId) {
  const query = useQuery({
    queryKey: explorerKeys.records,
    queryFn: () => explorerService.levelRecords(),
  });
  const { seen, markSeen } = useRegionsSeen();
  const records = query.data ?? NO_RECORDS;
  const regions = useMemo<IslandRegion[]>(() => {
    const island = islandOf(subjectId);
    if (!island) return [];
    const byLevel = new Map(records.map((record) => [record.levelId, record]));
    let number = 0;
    return island.regions.map((region) => ({
      ...regionSummary(island, region.id, byLevel, seen),
      region,
      number: region.kind === 'ilot' ? null : ++number,
    }));
  }, [subjectId, records, seen]);
  return { regions, markSeen };
}
