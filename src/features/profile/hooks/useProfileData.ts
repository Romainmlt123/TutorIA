import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { progressOf } from '@/features/avatar/logic/wardrobe';
import { ISLANDS } from '@/features/explorer/content';
import { explorerKeys } from '@/features/explorer/hooks/useExplorer';
import { regionSummary } from '@/features/explorer/logic/progression';
import { mondayOf, parisDay } from '@/lib/parisTime';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import {
  studentKeys,
  useStudentChapters,
  useStudentOverview,
} from '@/lib/session/useStudentOverview';
import { levelOf } from '@/lib/xpLevel';
import { explorerService } from '@/services/explorer';
import { studentDataService } from '@/services/student';

import { trophyShelf } from '../logic/trophies';

/** Une notion est acquise à 80 % de maîtrise, comme dans l'espace Parents. */
const ACQUIRED = 0.8;

/**
 * Le profil de l'élève (v2.8) : série, étoiles d'Explorer, temps de la semaine (heure de Paris),
 * niveau et XP, et l'étagère des trophées, calculés à partir de la progression enregistrée.
 */
export function useProfileData() {
  const account = useStudentAccount();
  const overview = useStudentOverview();
  const chapters = useStudentChapters();
  const records = useQuery({
    queryKey: explorerKeys.records,
    queryFn: () => explorerService.levelRecords(),
  });
  const monday = mondayOf(parisDay(new Date()));
  const week = useQuery({
    queryKey: [...studentKeys.activity, 'week', monday],
    queryFn: () => studentDataService.activity(monday),
  });

  return useMemo(() => {
    const levels = records.data ?? [];
    const byLevel = new Map(levels.map((r) => [r.levelId, r]));
    const progress = progressOf(
      ISLANDS,
      levels,
      Math.max(overview.streakDays, overview.recordStreak),
    );
    const regionsDone = new Set(
      ISLANDS.flatMap((island) =>
        island.regions
          .filter((region) => regionSummary(island, region.id, byLevel).status === 'done')
          .map((region) => region.id),
      ),
    );
    const level = levelOf(overview.xp);
    return {
      account,
      streak: overview.streakDays,
      stars: progress.stars,
      weekMinutes: (week.data ?? []).reduce((sum, day) => sum + day.minutes, 0),
      level,
      shelf: trophyShelf({
        ...progress,
        playerLevel: level.level,
        regionsDone,
        notions: chapters.filter((c) => (c.mastery ?? 0) >= ACQUIRED).length,
      }),
    };
  }, [account, overview, chapters, records.data, week.data]);
}
