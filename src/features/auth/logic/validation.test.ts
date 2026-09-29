import {
  hasErrors,
  isPasswordValid,
  isValidEmail,
  normalizeFirstName,
  passwordRules,
  validateParentSignUp,
  validateStudentSignUp,
} from './validation';

const valid = { firstName: 'Léa', email: 'lea@exemple.fr', password: 'Revision7' };

describe('passwordRules', () => {
  it('checks the length, a digit and an uppercase letter', () => {
    expect(passwordRules('')).toEqual([
      { id: 'length', ok: false },
      { id: 'digit', ok: false },
      { id: 'uppercase', ok: false },
    ]);
    expect(passwordRules('revision7')).toEqual([
      { id: 'length', ok: true },
      { id: 'digit', ok: true },
      { id: 'uppercase', ok: false },
    ]);
  });

  it('accepts accented uppercase letters', () => {
    expect(isPasswordValid('Élève2026')).toBe(true);
  });

  it('refuses a password of 7 characters', () => {
    expect(isPasswordValid('Revis7a')).toBe(false);
  });
});

describe('emails and first names', () => {
  it('accepts common addresses and refuses the others', () => {
    expect(isValidEmail(' Lea.Martin@Exemple.fr ')).toBe(true);
    expect(isValidEmail('lea@exemple')).toBe(false);
    expect(isValidEmail('lea exemple.fr')).toBe(false);
  });

  it('normalizes a first name', () => {
    expect(normalizeFirstName('  Léa   Marie ')).toBe('Léa Marie');
    expect(normalizeFirstName('x'.repeat(60))).toHaveLength(40);
  });
});

describe('validateStudentSignUp', () => {
  it('needs no parent e-mail from 15 years old', () => {
    expect(validateStudentSignUp({ ...valid, under15: false, parentEmail: '' })).toEqual({});
  });

  it('requires a parent e-mail under 15', () => {
    expect(validateStudentSignUp({ ...valid, under15: true, parentEmail: '' })).toEqual({
      parentEmail: 'required',
    });
  });

  it('refuses the student e-mail as parent e-mail', () => {
    expect(
      validateStudentSignUp({ ...valid, under15: true, parentEmail: 'LEA@exemple.fr' }),
    ).toEqual({ parentEmail: 'same_email' });
  });

  it('reports every invalid field', () => {
    const errors = validateStudentSignUp({
      firstName: ' ',
      email: 'lea@',
      password: 'court',
      under15: true,
      parentEmail: 'maman',
    });
    expect(errors).toEqual({
      firstName: 'required',
      email: 'invalid_email',
      password: 'weak_password',
      parentEmail: 'invalid_email',
    });
    expect(hasErrors(errors)).toBe(true);
  });
});

describe('validateParentSignUp', () => {
  it('requires the terms of use', () => {
    expect(validateParentSignUp({ ...valid, termsAccepted: false })).toEqual({
      terms: 'terms_required',
    });
    expect(hasErrors(validateParentSignUp({ ...valid, termsAccepted: true }))).toBe(false);
  });
});
