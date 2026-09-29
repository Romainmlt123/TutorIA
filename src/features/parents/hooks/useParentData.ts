import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  parentService,
  type ParentalSettings,
  type ParentNotifications,
  type ProgressPeriod,
} from '@/services/parents';

const keys = {
  week: (childId: string) => ['parent', 'week', childId] as const,
  progress: (childId: string, period: ProgressPeriod) =>
    ['parent', 'progress', childId, period] as const,
  sessions: (childId: string) => ['parent', 'sessions', childId] as const,
  settings: (childId: string) => ['parent', 'settings', childId] as const,
  notifications: ['parent', 'notifications'] as const,
};

export function useParentWeek(childId: string | null) {
  return useQuery({
    queryKey: keys.week(childId ?? ''),
    queryFn: () => parentService.week(childId ?? ''),
    enabled: Boolean(childId),
  });
}

export function useChildProgress(childId: string | null, period: ProgressPeriod) {
  return useQuery({
    queryKey: keys.progress(childId ?? '', period),
    queryFn: () => parentService.progress(childId ?? '', period),
    enabled: Boolean(childId),
  });
}

export function useChildSessions(childId: string | null) {
  return useQuery({
    queryKey: keys.sessions(childId ?? ''),
    queryFn: () => parentService.sessions(childId ?? ''),
    enabled: Boolean(childId),
  });
}

export function useParentalSettings(childId: string | null) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.settings(childId ?? ''),
    queryFn: () => parentService.settings(childId ?? ''),
    enabled: Boolean(childId),
  });
  // Mise à jour optimiste : l'interrupteur bascule tout de suite, et revient en cas d'échec.
  const update = useMutation({
    mutationFn: (patch: Partial<ParentalSettings>) =>
      parentService.updateSettings(childId ?? '', patch),
    onMutate: async (patch) => {
      const key = keys.settings(childId ?? '');
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ParentalSettings>(key);
      if (previous) queryClient.setQueryData(key, { ...previous, ...patch });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous)
        queryClient.setQueryData(keys.settings(childId ?? ''), context.previous);
    },
    onSuccess: (saved) => queryClient.setQueryData(keys.settings(childId ?? ''), saved),
  });
  return { query, update };
}

export function useParentNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: keys.notifications,
    queryFn: () => parentService.notifications(),
  });
  const update = useMutation({
    mutationFn: (patch: Partial<ParentNotifications>) => parentService.updateNotifications(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: keys.notifications });
      const previous = queryClient.getQueryData<ParentNotifications>(keys.notifications);
      if (previous) queryClient.setQueryData(keys.notifications, { ...previous, ...patch });
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) queryClient.setQueryData(keys.notifications, context.previous);
    },
    onSuccess: (saved) => queryClient.setQueryData(keys.notifications, saved),
  });
  return { query, update };
}
