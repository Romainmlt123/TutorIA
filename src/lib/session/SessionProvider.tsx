import { createContext, use, useSyncExternalStore, type ReactNode } from 'react';

import {
  authService,
  type Account,
  type ParentAccount,
  type Session,
  type StudentAccount,
} from '@/services/auth';

const LOADING: Session = { status: 'loading' };

const SessionContext = createContext<Session>(LOADING);

const subscribe = (listener: () => void) => authService.subscribe(listener);
const getSnapshot = () => authService.getSession();
// Rendu web côté serveur : aucune session.
const getServerSnapshot = () => LOADING;

/** Session courante, lue par les routes protégées et les écrans. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useSession(): Session {
  return use(SessionContext);
}

export function useAccount(): Account | null {
  const session = useSession();
  return session.status === 'signedIn' ? session.account : null;
}

export function useStudentAccount(): StudentAccount | null {
  const account = useAccount();
  return account?.role === 'student' ? account : null;
}

export function useParentAccount(): ParentAccount | null {
  const account = useAccount();
  return account?.role === 'parent' ? account : null;
}
