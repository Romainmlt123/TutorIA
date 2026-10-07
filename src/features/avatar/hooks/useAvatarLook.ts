import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useStudentAccount } from '@/lib/session/SessionProvider';
import { avatarService } from '@/services/avatar';

import type { AvatarLook } from '../logic/avatarLook';
import { starterLook } from '../logic/editor';

const lookKey = (accountId: string | undefined) => ['avatar', 'look', accountId] as const;

/** Avatar enregistré de l'élève connecté : null tant qu'il n'en a pas créé. */
export function useAvatarLook() {
  const accountId = useStudentAccount()?.id;
  return useQuery({
    queryKey: lookKey(accountId),
    queryFn: () => avatarService.look(accountId!),
    enabled: accountId !== undefined,
    staleTime: Infinity,
  });
}

export function useSaveAvatarLook() {
  const queryClient = useQueryClient();
  const accountId = useStudentAccount()?.id;
  return useMutation({
    mutationFn: async (look: AvatarLook) => {
      if (!accountId) throw new Error('avatar : aucun élève connecté');
      await avatarService.saveLook(accountId, look);
    },
    onSuccess: (_, look) => queryClient.setQueryData(lookKey(accountId), look),
  });
}

/**
 * La figurine à montrer pour l'élève connecté : son avatar enregistré, sinon sa figurine de départ
 * (la même que l'éditeur lui propose). Null tant que l'enregistrement n'a pas été lu.
 */
export function useStudentLook(): AvatarLook | null {
  const accountId = useStudentAccount()?.id;
  const saved = useAvatarLook();
  if (!accountId || saved.isPending) return null;
  return saved.data ?? starterLook(accountId);
}
