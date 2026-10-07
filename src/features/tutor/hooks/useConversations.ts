import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { logError } from '@/lib/logger';
import { conversationService } from '@/services/conversations';

import { chatMessagesOf } from '../logic/conversations';

export const conversationKeys = {
  list: ['conversations', 'list'] as const,
  messages: (id: string) => ['conversations', 'messages', id] as const,
};

/** Discussions libres du volet, les plus récentes d'abord. */
export function useConversationList() {
  return useQuery({ queryKey: conversationKeys.list, queryFn: () => conversationService.list() });
}

/**
 * Messages d'une discussion à rouvrir. Relus à chaque ouverture (rien n'est gardé en cache une fois
 * la discussion fermée), pour ne jamais rouvrir une version d'avant les derniers échanges.
 */
export function useConversationMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: conversationKeys.messages(conversationId ?? ''),
    queryFn: async () => chatMessagesOf(await conversationService.messages(conversationId!)),
    enabled: !!conversationId,
    staleTime: Infinity,
    gcTime: 0,
  });
}

/** Suppression d'une discussion et de ses messages, puis la liste du volet est relue. */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) => conversationService.remove(conversationId),
    onError: (error) => logError('tutor.deleteConversation', error),
    onSettled: () => queryClient.invalidateQueries({ queryKey: conversationKeys.list }),
  });
}
