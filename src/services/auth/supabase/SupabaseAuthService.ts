import type { AuthChangeEvent, Session as SupabaseSession, User } from '@supabase/supabase-js';

import type { Grade } from '@/data/types';
import { logError } from '@/lib/logger';

import type { AppSupabaseClient } from '../../supabase/client';
import { callAccountApi } from '../accountApi';
import type {
  CreateLinkCodeRequest,
  CreateLinkCodeResponse,
  RedeemLinkCodeResponse,
} from '../api-contract';
import {
  AuthError,
  type Account,
  type AccountExport,
  type AuthErrorCode,
  type AuthService,
  type ParentSignUp,
  type Session,
  type StudentSignUp,
} from '../AuthService';
import { accountCache, SessionStore } from '../sessionStore';

const CONSENT_DELAY_DAYS = 30;

type SupabaseAuthErrorLike = { code?: string; name?: string; message?: string };

/** Erreurs de Supabase Auth traduites en codes prévus par les écrans. */
export function authErrorCode(error: SupabaseAuthErrorLike): AuthErrorCode {
  switch (error.code) {
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'email_not_confirmed':
      return 'email_not_confirmed';
    case 'user_already_exists':
    case 'email_exists':
      return 'email_taken';
    case 'weak_password':
      return 'weak_password';
    case 'otp_expired':
      return 'invalid_otp';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'rate_limited';
    default:
      return error.name === 'AuthRetryableFetchError' ? 'network' : 'upstream';
  }
}

function raise(scope: string, error: SupabaseAuthErrorLike): never {
  const code = authErrorCode(error);
  if (code === 'upstream' || code === 'network') logError(scope, error);
  throw new AuthError(code);
}

async function fetchAccount(supabase: AppSupabaseClient, user: User): Promise<Account | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'role, first_name, student:students(grade, under_15, consent_status, onboarding_completed_at, created_at), parent:parents(terms_accepted_at)',
    )
    .eq('id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const email = user.email ?? '';
  if (data.role === 'parent') {
    return {
      role: 'parent',
      id: user.id,
      email,
      firstName: data.first_name,
      accountReady: Boolean(data.parent?.terms_accepted_at),
    };
  }
  const student = data.student;
  if (!student) return null;
  const deadline =
    student.consent_status === 'pending'
      ? new Date(Date.parse(student.created_at) + CONSENT_DELAY_DAYS * 86_400_000).toISOString()
      : null;
  return {
    role: 'student',
    id: user.id,
    email,
    firstName: data.first_name ?? '',
    grade: student.grade,
    under15: student.under_15,
    consentStatus: student.consent_status,
    consentDeadline: deadline,
    onboardingCompleted: student.onboarding_completed_at !== null,
    createdAt: student.created_at,
  };
}

/**
 * Comptes sur Supabase Auth. Les mots de passe vont directement de l'app à Supabase Auth ;
 * les actions réservées (codes de liaison, consentement, suppression) passent par le serveur.
 */
export class SupabaseAuthService implements AuthService {
  private readonly store = new SessionStore();
  private started = false;
  private recovery = false;
  private freshSignUp = false;
  private user: User | null = null;

  constructor(private readonly supabase: AppSupabaseClient) {}

  private start(): void {
    if (this.started) return;
    this.started = true;
    this.supabase.auth.onAuthStateChange((event, session) => {
      // La documentation Supabase déconseille d'attendre un appel Supabase dans ce rappel.
      setTimeout(() => void this.onAuthChange(event, session), 0);
    });
  }

  private async onAuthChange(event: AuthChangeEvent, session: SupabaseSession | null) {
    if (event === 'PASSWORD_RECOVERY') this.recovery = true;
    if (!session) {
      this.user = null;
      this.recovery = false;
      this.freshSignUp = false;
      this.store.set({ status: 'signedOut' });
      return;
    }
    const sameUser = this.user?.id === session.user.id;
    this.user = session.user;
    if (event === 'TOKEN_REFRESHED' && sameUser && this.store.get().status === 'signedIn') return;
    await this.loadAccount(session.user);
  }

  private emit(account: Account): void {
    this.store.set({
      status: 'signedIn',
      account,
      recovery: this.recovery,
      freshSignUp: this.freshSignUp,
    });
  }

  private async loadAccount(user: User): Promise<void> {
    const cached = await accountCache.read(user.id);
    if (cached && this.store.get().status !== 'signedIn') this.emit(cached);
    try {
      const account = await fetchAccount(this.supabase, user);
      if (!account) {
        // Jeton encore valable mais compte supprimé : on ferme la session.
        await accountCache.clear();
        await this.supabase.auth.signOut({ scope: 'local' });
        return;
      }
      await accountCache.write(account);
      this.emit(account);
    } catch (error) {
      logError('auth.account', error);
      if (!cached) this.store.set({ status: 'unavailable' });
    }
  }

  getSession(): Session {
    this.start();
    return this.store.get();
  }

  subscribe(listener: (session: Session) => void): () => void {
    this.start();
    return this.store.subscribe(listener);
  }

  async getAccessToken(): Promise<string | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async signIn(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) raise('auth.signIn', error);
  }

  async signOut(): Promise<void> {
    await accountCache.clear();
    const { error } = await this.supabase.auth.signOut({ scope: 'local' });
    if (error) raise('auth.signOut', error);
  }

  async signUpStudent({ firstName, email, password, under15 }: StudentSignUp): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: { data: { role: 'student', first_name: firstName, under_15: under15 } },
    });
    if (error) raise('auth.signUp', error);
  }

  async signUpParent({ firstName, email, password, weeklyReport }: ParentSignUp): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'parent',
          first_name: firstName,
          terms_accepted: true,
          weekly_report: weeklyReport,
        },
      },
    });
    if (error) raise('auth.signUp', error);
  }

  async resendSignUpCode(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resend({ type: 'signup', email });
    if (error) raise('auth.resend', error);
  }

  async verifySignUpCode(email: string, code: string): Promise<void> {
    this.freshSignUp = true;
    const { error } = await this.supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) {
      this.freshSignUp = false;
      raise('auth.verify', error);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) raise('auth.reset', error);
  }

  async verifyRecoveryCode(email: string, code: string): Promise<void> {
    this.recovery = true;
    const { error } = await this.supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (error) {
      this.recovery = false;
      raise('auth.recovery', error);
    }
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password });
    if (error) raise('auth.password', error);
    this.recovery = false;
    const session = this.store.get();
    if (session.status === 'signedIn') this.emit(session.account);
  }

  async acceptInvite(tokenHash: string): Promise<void> {
    const { error } = await this.supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'invite' });
    if (error) {
      const code = authErrorCode(error);
      throw new AuthError(code === 'invalid_otp' ? 'invalid_invite' : code);
    }
  }

  async refreshAccount(): Promise<void> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) {
      if (error) logError('auth.refresh', error);
      if (this.store.get().status === 'unavailable') return;
      this.store.set({ status: 'signedOut' });
      return;
    }
    this.user = data.user;
    await this.loadAccount(data.user);
  }

  acknowledgeSignUp(): void {
    this.freshSignUp = false;
    const session = this.store.get();
    if (session.status === 'signedIn') this.emit(session.account);
  }

  async createLinkCode(childFirstName: string, childGrade: Grade): Promise<CreateLinkCodeResponse> {
    const body: CreateLinkCodeRequest = { childFirstName, childGrade };
    return callAccountApi('/api/link-codes/create', await this.getAccessToken(), { body });
  }

  async redeemLinkCode(code: string): Promise<RedeemLinkCodeResponse> {
    const result = await callAccountApi<RedeemLinkCodeResponse>(
      '/api/link-codes/redeem',
      await this.getAccessToken(),
      { body: { code } },
    );
    await this.refreshAccount();
    return result;
  }

  async requestParentConsent(parentEmail: string): Promise<void> {
    await callAccountApi('/api/consent/request', await this.getAccessToken(), {
      body: { parentEmail },
    });
  }

  async exportData(): Promise<AccountExport> {
    const data = await callAccountApi<unknown>('/api/account/export', await this.getAccessToken(), {
      method: 'GET',
    });
    const day = new Date().toISOString().slice(0, 10);
    return { fileName: `tutoria-donnees-${day}.json`, json: JSON.stringify(data, null, 2) };
  }

  async deleteAccount(): Promise<void> {
    await callAccountApi('/api/account/delete', await this.getAccessToken());
    await accountCache.clear();
    const { error } = await this.supabase.auth.signOut({ scope: 'local' });
    if (error) logError('auth.delete', error);
  }
}
