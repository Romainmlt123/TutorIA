import { isValidEmail, normalizeEmail, normalizeFirstName } from '@/services/auth/api-contract';

export { isValidEmail, normalizeEmail, normalizeFirstName };

/** Règles du mot de passe, affichées en direct sous le champ (PasswordRules). */
export type PasswordRuleId = 'length' | 'digit' | 'uppercase';

export const PASSWORD_MIN_LENGTH = 8;

export function passwordRules(password: string): { id: PasswordRuleId; ok: boolean }[] {
  return [
    { id: 'length', ok: password.length >= PASSWORD_MIN_LENGTH },
    { id: 'digit', ok: /\d/.test(password) },
    { id: 'uppercase', ok: /\p{Lu}/u.test(password) },
  ];
}

export function isPasswordValid(password: string): boolean {
  return passwordRules(password).every((rule) => rule.ok);
}

export type SignUpField = 'firstName' | 'email' | 'password' | 'parentEmail' | 'terms';

export type SignUpError =
  'required' | 'invalid_email' | 'weak_password' | 'same_email' | 'terms_required';

export type FieldErrors = Partial<Record<SignUpField, SignUpError>>;

type AccountFields = { firstName: string; email: string; password: string };

function validateAccount({ firstName, email, password }: AccountFields): FieldErrors {
  const errors: FieldErrors = {};
  if (!normalizeFirstName(firstName)) errors.firstName = 'required';
  if (!email.trim()) errors.email = 'required';
  else if (!isValidEmail(email)) errors.email = 'invalid_email';
  if (!isPasswordValid(password)) errors.password = 'weak_password';
  return errors;
}

/** E1 : sous 15 ans, l'e-mail d'un parent est obligatoire et différent de celui de l'élève. */
export function validateStudentSignUp(
  input: AccountFields & { under15: boolean; parentEmail: string },
): FieldErrors {
  const errors = validateAccount(input);
  if (input.under15) {
    if (!input.parentEmail.trim()) errors.parentEmail = 'required';
    else if (!isValidEmail(input.parentEmail)) errors.parentEmail = 'invalid_email';
    else if (normalizeEmail(input.parentEmail) === normalizeEmail(input.email)) {
      errors.parentEmail = 'same_email';
    }
  }
  return errors;
}

/** L4 : les conditions d'utilisation doivent être acceptées. */
export function validateParentSignUp(
  input: AccountFields & { termsAccepted: boolean },
): FieldErrors {
  const errors = validateAccount(input);
  if (!input.termsAccepted) errors.terms = 'terms_required';
  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
