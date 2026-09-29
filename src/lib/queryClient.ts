import { QueryClient } from '@tanstack/react-query';

import { authService } from '@/services/auth';

/**
 * Cache des données des écrans (TanStack Query) : une donnée lue reste fraîche une minute,
 * un seul nouvel essai en cas d'échec.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
    mutations: { retry: 0 },
  },
});

// Changement de compte : le cache est vidé dès que la session change, avant le rendu des écrans,
// pour qu'aucune donnée ne passe d'un utilisateur à l'autre.
let currentAccountId: string | null = null;
authService.subscribe((session) => {
  const accountId = session.status === 'signedIn' ? session.account.id : null;
  if (accountId === currentAccountId) return;
  currentAccountId = accountId;
  queryClient.clear();
});
