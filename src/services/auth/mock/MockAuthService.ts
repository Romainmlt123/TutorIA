import type { Grade } from '@/data/types';

import {
  isLinkCodeFormat,
  normalizeEmail,
  type CreateLinkCodeResponse,
  type RedeemLinkCodeResponse,
} from '../api-contract';
import {
  AuthError,
  type Account,
  type AccountExport,
  type AuthService,
  type ParentSignUp,
  type Session,
  type StudentAccount,
  type StudentSignUp,
} from '../AuthService';
import { SessionStore } from '../sessionStore';

export type PersonaId = 'lea' | 'claire' | 'hugo';

/** Comptes de démonstration, cohérents avec le seed de la base (scripts/seed.ts). */
export const PERSONAS: Record<PersonaId, Account> = {
  lea: {
    role: 'student',
    id: 'demo-lea',
    email: 'lea@tutoria.test',
    firstName: 'Léa',
    grade: '4e',
    under15: true,
    consentStatus: 'granted',
    consentDeadline: null,
    onboardingCompleted: true,
    createdAt: '2026-09-01T08:00:00.000Z',
  },
  claire: {
    role: 'parent',
    id: 'demo-claire',
    email: 'claire@tutoria.test',
    firstName: 'Claire',
    accountReady: true,
  },
  hugo: {
    role: 'student',
    id: 'demo-hugo',
    email: 'hugo@tutoria.test',
    firstName: 'Hugo',
    grade: null,
    under15: true,
    consentStatus: 'pending',
    consentDeadline: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    onboardingCompleted: false,
    createdAt: '2026-09-15T08:00:00.000Z',
  },
};

type LinkCode = { parentId: string; childFirstName: string; expiresAt: string };

const nameKey = (name: string) => name.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

/**
 * Authentification simulée, en mémoire : tests, développement hors ligne et démonstration.
 * Aucun mot de passe n'est stocké : tout mot de passe non vide ouvre un compte connu,
 * et tout code à 6 chiffres est accepté.
 */
export class MockAuthService implements AuthService {
  private readonly store = new SessionStore();
  private readonly accounts = new Map<string, Account>();
  private readonly pending = new Map<string, Account>();
  private readonly codes = new Map<string, LinkCode>();
  private recovery = false;
  private freshSignUp = false;
  private counter = 0;

  constructor(initial: Session = { status: 'signedOut' }) {
    for (const persona of Object.values(PERSONAS)) this.accounts.set(persona.email, persona);
    this.store.set(initial);
  }

  private emit(account: Account | null): void {
    if (!account) {
      this.recovery = false;
      this.freshSignUp = false;
      this.store.set({ status: 'signedOut' });
      return;
    }
    this.accounts.set(account.email, account);
    this.store.set({
      status: 'signedIn',
      account,
      recovery: this.recovery,
      freshSignUp: this.freshSignUp,
    });
  }

  private current(): Account {
    const session = this.store.get();
    if (session.status !== 'signedIn') throw new AuthError('unauthorized');
    return session.account;
  }

  /** Change de persona (catalogue de développement). */
  signInAs(persona: PersonaId): void {
    this.recovery = false;
    this.freshSignUp = false;
    this.emit(this.accounts.get(PERSONAS[persona].email) ?? PERSONAS[persona]);
  }

  /** Met à jour le compte connecté (onboarding terminé, consentement…). */
  updateAccount(patch: Partial<StudentAccount>): void {
    const account = this.current();
    this.emit({ ...account, ...patch } as Account);
  }

  getSession(): Session {
    return this.store.get();
  }

  subscribe(listener: (session: Session) => void): () => void {
    return this.store.subscribe(listener);
  }

  async getAccessToken(): Promise<string | null> {
    return null;
  }

  async signIn(email: string, password: string): Promise<void> {
    const account = this.accounts.get(normalizeEmail(email));
    if (!account || !password) throw new AuthError('invalid_credentials');
    this.emit(account);
  }

  async signOut(): Promise<void> {
    this.emit(null);
  }

  async signUpStudent({ firstName, email, under15 }: StudentSignUp): Promise<void> {
    this.counter += 1;
    this.pending.set(normalizeEmail(email), {
      role: 'student',
      id: `mock-student-${this.counter}`,
      email: normalizeEmail(email),
      firstName,
      grade: null,
      under15,
      consentStatus: under15 ? 'pending' : 'not_required',
      consentDeadline: under15 ? new Date(Date.now() + 30 * 86_400_000).toISOString() : null,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    });
  }

  async signUpParent({ firstName, email }: ParentSignUp): Promise<void> {
    this.counter += 1;
    this.pending.set(normalizeEmail(email), {
      role: 'parent',
      id: `mock-parent-${this.counter}`,
      email: normalizeEmail(email),
      firstName,
      accountReady: true,
    });
  }

  async resendSignUpCode(): Promise<void> {}

  async verifySignUpCode(email: string, code: string): Promise<void> {
    const account = this.pending.get(normalizeEmail(email));
    if (!account || !isLinkCodeFormat(code)) throw new AuthError('invalid_otp');
    this.pending.delete(normalizeEmail(email));
    this.freshSignUp = true;
    this.emit(account);
  }

  async requestPasswordReset(): Promise<void> {}

  async verifyRecoveryCode(email: string, code: string): Promise<void> {
    const account = this.accounts.get(normalizeEmail(email));
    if (!account || !isLinkCodeFormat(code)) throw new AuthError('invalid_otp');
    this.recovery = true;
    this.emit(account);
  }

  async updatePassword(): Promise<void> {
    this.recovery = false;
    this.emit(this.current());
  }

  async acceptInvite(tokenHash: string): Promise<void> {
    if (!tokenHash) throw new AuthError('invalid_invite');
    this.counter += 1;
    this.emit({
      role: 'parent',
      id: `mock-parent-${this.counter}`,
      email: `parent${this.counter}@tutoria.test`,
      firstName: null,
      accountReady: false,
    });
  }

  async refreshAccount(): Promise<void> {
    const session = this.store.get();
    if (session.status === 'signedIn') this.emit(session.account);
  }

  acknowledgeSignUp(): void {
    this.freshSignUp = false;
    const session = this.store.get();
    if (session.status === 'signedIn') this.emit(session.account);
  }

  async createLinkCode(childFirstName: string, _grade: Grade): Promise<CreateLinkCodeResponse> {
    const parent = this.current();
    if (parent.role !== 'parent') throw new AuthError('forbidden');
    const code = String(100_000 + ((this.codes.size * 7_919 + 482_913) % 900_000));
    const expiresAt = new Date(Date.now() + 24 * 3_600_000).toISOString();
    this.codes.set(code, { parentId: parent.id, childFirstName, expiresAt });
    return { code, expiresAt };
  }

  async redeemLinkCode(code: string): Promise<RedeemLinkCodeResponse> {
    const student = this.current();
    if (student.role !== 'student') throw new AuthError('forbidden');
    const link = this.codes.get(code);
    if (!link || Date.parse(link.expiresAt) <= Date.now()) throw new AuthError('invalid_code');
    if (nameKey(link.childFirstName) !== nameKey(student.firstName)) {
      throw new AuthError('name_mismatch');
    }
    this.codes.delete(code);
    this.emit({
      ...student,
      consentStatus: student.under15 ? 'granted' : student.consentStatus,
      consentDeadline: null,
    });
    return { status: 'linked' };
  }

  async requestParentConsent(parentEmail: string): Promise<void> {
    const student = this.current();
    if (normalizeEmail(parentEmail) === student.email) throw new AuthError('same_email');
  }

  async exportData(): Promise<AccountExport> {
    const account = this.current();
    return {
      fileName: 'tutoria-donnees-demo.json',
      json: JSON.stringify({ exportedAt: new Date().toISOString(), account }, null, 2),
    };
  }

  async deleteAccount(): Promise<void> {
    const account = this.current();
    this.accounts.delete(account.email);
    this.emit(null);
  }
}
