import { createContext, use, useState, type ReactNode } from 'react';

import type { LinkedChild } from '@/services/family';

import { useChildren } from './useFamily';

type SelectedChild = {
  children: readonly LinkedChild[];
  child: LinkedChild | null;
  select: (child: LinkedChild) => void;
  loading: boolean;
  failed: boolean;
  retry: () => void;
};

const SelectedChildContext = createContext<SelectedChild | null>(null);

/** Enfant affiché dans l'espace Parents (le premier relié par défaut), partagé par les 4 onglets. */
export function SelectedChildProvider({ children }: { children: ReactNode }) {
  const query = useChildren();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const list = query.data ?? [];
  const child = list.find((c) => c.id === selectedId) ?? list[0] ?? null;
  return (
    <SelectedChildContext
      value={{
        children: list,
        child,
        select: (next) => setSelectedId(next.id),
        loading: query.isPending,
        failed: query.isError,
        retry: () => void query.refetch(),
      }}>
      {children}
    </SelectedChildContext>
  );
}

export function useSelectedChild(): SelectedChild {
  const state = use(SelectedChildContext);
  if (!state) throw new Error('useSelectedChild hors de SelectedChildProvider');
  return state;
}
