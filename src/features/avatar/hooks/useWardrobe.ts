import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { ISLANDS } from '@/features/explorer/content';
import { explorerKeys } from '@/features/explorer/hooks/useExplorer';
import { logError } from '@/lib/logger';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import { avatarService } from '@/services/avatar';
import type { WardrobeRecord } from '@/services/avatar/AvatarService';
import { explorerService } from '@/services/explorer';

import { ownedItems, progressOf, WARDROBE } from '../logic/wardrobe';

const wardrobeKey = (accountId: string | undefined) => ['avatar', 'wardrobe', accountId] as const;

/**
 * La garde-robe de l'élève connecté : les objets gagnés (retenus pour toujours, et ceux que sa
 * progression vient de lui faire gagner) et les nouveaux, pas encore annoncés.
 */
export function useWardrobe() {
  const accountId = useStudentAccount()?.id;
  const queryClient = useQueryClient();
  const overview = useStudentOverview();
  const records = useQuery({
    queryKey: explorerKeys.records,
    queryFn: () => explorerService.levelRecords(),
  });
  const stored = useQuery({
    queryKey: wardrobeKey(accountId),
    queryFn: () => avatarService.wardrobe(accountId!),
    enabled: accountId !== undefined,
    staleTime: Infinity,
  });
  const bestStreak = Math.max(overview.streakDays, overview.recordStreak);
  const owned = useMemo(
    () => ownedItems(stored.data?.owned ?? [], progressOf(ISLANDS, records.data ?? [], bestStreak)),
    [stored.data, records.data, bestStreak],
  );

  const save = useCallback(
    (next: WardrobeRecord) => {
      if (!accountId) return;
      queryClient.setQueryData(wardrobeKey(accountId), next);
      avatarService
        .saveWardrobe(accountId, next)
        .catch((error: unknown) => logError('avatar.wardrobe.write', error));
    },
    [accountId, queryClient],
  );

  // Un objet gagné est retenu aussitôt : il reste à l'élève même si la condition retombe.
  useEffect(() => {
    if (!stored.data) return;
    const known = new Set(stored.data.owned);
    const gained = [...owned].filter((id) => !known.has(id));
    if (gained.length > 0) save({ ...stored.data, owned: [...stored.data.owned, ...gained] });
  }, [owned, stored.data, save]);

  const ready = stored.isSuccess && records.isSuccess;
  const fresh = useMemo(() => {
    if (!ready || !stored.data) return [];
    const announced = new Set(stored.data.announced);
    return WARDROBE.filter((item) => owned.has(item.id) && !announced.has(item.id));
  }, [ready, owned, stored.data]);

  const markAnnounced = useCallback(() => {
    if (!stored.data || fresh.length === 0) return;
    save({ ...stored.data, announced: [...stored.data.announced, ...fresh.map((f) => f.id)] });
  }, [stored.data, fresh, save]);

  return { owned, fresh, markAnnounced };
}
