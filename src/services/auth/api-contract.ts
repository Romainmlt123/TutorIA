import type { Grade } from '@/data/types';

/*
 * Contrat entre l'app et les routes des comptes (codes de liaison, consentement, suppression, export).
 * Partagé par l'app et le serveur : aucun secret ici. Les mots de passe ne passent jamais par ces routes.
 */

export const LINK_CODE_LENGTH = 6;
export const LINK_CODE_TTL_HOURS = 24;

/** Garde uniquement les chiffres saisis : « 482 913 » devient « 482913 ». */
export function normalizeLinkCode(input: string): string {
  return input.replace(/\D/g, '').slice(0, LINK_CODE_LENGTH);
}

export function isLinkCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/** Affichage lisible : « 482 913 ». */
export function formatLinkCode(code: string): string {
  return `${code.slice(0, 3)} ${code.slice(3)}`;
}

export function isLinkCodeExpired(expiresAt: string, now = new Date()): boolean {
  return new Date(expiresAt).getTime() <= now.getTime();
}

export type AccountErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'invalid_code'
  | 'name_mismatch'
  | 'children_limit'
  | 'same_email'
  | 'not_found'
  | 'upstream'
  | 'network'
  | 'timeout';

export type AccountErrorResponse = { error: AccountErrorCode };

/** POST /api/link-codes/create (parent, L5). */
export type CreateLinkCodeRequest = { childFirstName: string; childGrade: Grade };
export type CreateLinkCodeResponse = { code: string; expiresAt: string };

/** POST /api/link-codes/redeem (élève : L2, profil, O5). */
export type RedeemLinkCodeRequest = { code: string };
export type RedeemLinkCodeResponse = { status: 'linked' | 'already_linked' };

/** POST /api/consent/request (élève de moins de 15 ans) : invite ou prévient un parent. */
export type ConsentRequestBody = { parentEmail: string };

/**
 * POST /api/link-requests/accept (parent) : relie l'enfant et valide son compte.
 * `firstName` finalise le compte d'un parent invité ; sans `studentId`, seule la finalisation a lieu.
 */
export type AcceptLinkRequestBody = { studentId?: string; firstName?: string };

/** POST /api/account/delete-child (parent qui a validé le compte d'un enfant de moins de 15 ans). */
export type DeleteChildBody = { studentId: string };

export const FIRST_NAME_MAX_LENGTH = 40;

/** Prénom saisi : espaces réduits, 40 caractères au plus. */
export function normalizeFirstName(input: string): string {
  return input.trim().replace(/\s+/g, ' ').slice(0, FIRST_NAME_MAX_LENGTH);
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

/** Vérification volontairement simple : l'adresse est confirmée ensuite par un code. */
export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizeEmail(input)) && input.length <= 254;
}
