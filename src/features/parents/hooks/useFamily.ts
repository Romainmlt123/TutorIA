import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Grade } from '@/data/types';
import { familyService } from '@/services/family';

export const familyKeys = {
  requests: ['family', 'requests'] as const,
  children: ['family', 'children'] as const,
  parents: ['family', 'parents'] as const,
  week: (ids: readonly string[]) => ['family', 'week', ...ids] as const,
};

/** Parent : demandes de liaison en attente. */
export function useLinkRequests() {
  return useQuery({ queryKey: familyKeys.requests, queryFn: () => familyService.linkRequests() });
}

/** Parent : enfants reliés. */
export function useChildren() {
  return useQuery({ queryKey: familyKeys.children, queryFn: () => familyService.children() });
}

/** Parent : temps des 7 derniers jours de chaque enfant, en secondes (F3). */
export function useChildrenWeek(ids: readonly string[], enabled = true) {
  return useQuery({
    queryKey: familyKeys.week(ids),
    queryFn: () => familyService.weekSeconds(ids),
    enabled: enabled && ids.length > 0,
  });
}

/** Parent qui a validé le compte d'un enfant de moins de 15 ans : prénom et classe (F5). */
export function useUpdateChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, firstName, grade }: { id: string; firstName: string; grade: Grade }) =>
      familyService.updateChild(id, firstName, grade),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: familyKeys.children }),
  });
}

/** Parent : accepter ou refuser une demande ; la liste des enfants est relue ensuite. */
export function useLinkRequestActions() {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: familyKeys.requests }),
      queryClient.invalidateQueries({ queryKey: familyKeys.children }),
    ]);
  const accept = useMutation({
    mutationFn: ({ studentId, firstName }: { studentId: string | null; firstName?: string }) =>
      familyService.acceptLinkRequest(studentId, firstName),
    onSuccess: refresh,
  });
  const decline = useMutation({
    mutationFn: (studentId: string) => familyService.declineLinkRequest(studentId),
    onSuccess: refresh,
  });
  return { accept, decline };
}
