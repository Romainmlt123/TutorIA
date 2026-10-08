import type { ConsentStatus, Grade } from '@/data/types';

import type {
  AccountErrorCode,
  CreateLinkCodeResponse,
  RedeemLinkCodeResponse,
} from './api-contract';

export type StudentAccount = {
  role: 'student';
  id: string;
  email: string;
  firstName: string;
  grade: Grade | null;
  under15: boolean;
  consentStatus: ConsentStatus;
  /** Sous 15 ans sans validation : date de suppression automatique du compte. */
  consentDeadline: string | null;
  onboardingCompleted: boolean;
  /** Création du compte (profil : « Depuis septembre »). */
  createdAt: string;
};

export type ParentAccount = {
  role: 'parent';
  id: string;
  email: string;
  /** Vide tant qu'un parent invité n'a pas finalisé son compte. */
  firstName: string | null;
  accountReady: boolean;
};

export type Account = StudentAccount | ParentAccount;

export type Session =
  | { status: 'loading' }
  | { status: 'signedOut' }
  /** Session présente mais compte illisible (hors ligne au premier lancement) : l'écran propose de réessayer. */
  | { status: 'unavailable' }
  | {
      status: 'signedIn';
      account: Account;
      /** Connexion par un code de récupération : le nouveau mot de passe reste à choisir. */
      recovery: boolean;
      /** Compte créé à l'instant : le parent enchaîne sur l'ajout de son enfant (L5). */
      freshSignUp: boolean;
    };

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'email_taken'
  | 'weak_password'
  | 'invalid_otp'
  | 'invalid_invite'
  | AccountErrorCode;

/** Erreur prévue d'un parcours de connexion : l'écran affiche le message correspondant. */
export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
  }
}

export type StudentSignUp = {
  firstName: string;
  email: string;
  password: string;
  under15: boolean;
};

export type ParentSignUp = {
  firstName: string;
  email: string;
  password: string;
  weeklyReport: boolean;
};

/** Export RGPD : les données du compte, en JSON lisible. */
export type AccountExport = { fileName: string; json: string };

/**
 * Comptes et session. Les mots de passe vont directement à Supabase Auth :
 * ils ne passent jamais par nos tables, nos journaux ni nos routes API.
 */
export interface AuthService {
  getSession(): Session;
  subscribe(listener: (session: Session) => void): () => void;
  /** Jeton à présenter aux routes API, ou `null` sans session. */
  getAccessToken(): Promise<string | null>;

  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  /** Crée le compte et envoie un code à 6 chiffres par e-mail. */
  signUpStudent(input: StudentSignUp): Promise<void>;
  signUpParent(input: ParentSignUp): Promise<void>;
  resendSignUpCode(email: string): Promise<void>;
  verifySignUpCode(email: string, code: string): Promise<void>;

  requestPasswordReset(email: string): Promise<void>;
  verifyRecoveryCode(email: string, code: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  /** Parent invité par son enfant : ouvre une session à partir du lien de l'e-mail. */
  acceptInvite(tokenHash: string): Promise<void>;

  /** Relit le compte (onboarding terminé, consentement validé…) ; sert aussi à réessayer. */
  refreshAccount(): Promise<void>;
  /** Fin de l'enchaînement d'inscription du parent. */
  acknowledgeSignUp(): void;

  createLinkCode(childFirstName: string, childGrade: Grade): Promise<CreateLinkCodeResponse>;
  redeemLinkCode(code: string): Promise<RedeemLinkCodeResponse>;
  /** Élève de moins de 15 ans : invite ou prévient un parent. */
  requestParentConsent(parentEmail: string): Promise<void>;

  exportData(): Promise<AccountExport>;
  deleteAccount(): Promise<void>;
}
