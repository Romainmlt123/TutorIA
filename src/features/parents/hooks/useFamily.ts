import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { familyService } from '@/services/family';

export const familyKeys = {
  requests: ['family', 'requests'] as const,
  children: ['family', 'children'] as const,
  parents: ['family', 'parents'] as const,
};

/** Parent : demandes de liaison en attente. */
export function useLinkRequests() {
  return useQuery({ queryKey: familyKeys.requests, queryFn: () => familyService.linkRequests() });
}

/** Parent : enfants reliés. */
export function useChildren() {
  return useQuery({ queryKey: familyKeys.children, queryFn: () => familyService.children() });
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
