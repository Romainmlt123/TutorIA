import type { ParentAccount, StudentAccount } from '@/services/auth/AuthService';

import { resolveSpace } from './resolveSpace';

const student: StudentAccount = {
  role: 'student',
  id: 's1',
  email: 'lea@exemple.fr',
  firstName: 'Léa',
  grade: '4e',
  under15: true,
  consentStatus: 'granted',
  consentDeadline: null,
  onboardingCompleted: true,
};

const parent: ParentAccount = {
  role: 'parent',
  id: 'p1',
  email: 'claire@exemple.fr',
  firstName: 'Claire',
  accountReady: true,
};

const signedIn = (account: StudentAccount | ParentAccount, recovery = false) =>
  ({ status: 'signedIn', account, recovery, freshSignUp: false }) as const;

describe('resolveSpace', () => {
  it('waits while the session loads', () => {
    expect(resolveSpace({ status: 'loading' })).toBe('loading');
  });

  it('offers a retry when the account cannot be read', () => {
    expect(resolveSpace({ status: 'unavailable' })).toBe('unavailable');
  });

  it('shows the sign-in screens without a session', () => {
    expect(resolveSpace({ status: 'signedOut' })).toBe('auth');
  });

  it('sends a student to the onboarding until it is finished', () => {
    expect(resolveSpace(signedIn({ ...student, onboardingCompleted: false }))).toBe('onboarding');
    expect(resolveSpace(signedIn(student))).toBe('student');
  });

  it('opens the student space even while the parental consent is pending', () => {
    expect(resolveSpace(signedIn({ ...student, consentStatus: 'pending' }))).toBe('student');
  });

  it('sends a parent to the parent space', () => {
    expect(resolveSpace(signedIn(parent))).toBe('parent');
  });

  it('asks an invited parent to finalize the account', () => {
    expect(resolveSpace(signedIn({ ...parent, firstName: null, accountReady: false }))).toBe(
      'account',
    );
  });

  it('asks for a new password after a recovery code, whatever the role', () => {
    expect(resolveSpace(signedIn(student, true))).toBe('account');
    expect(resolveSpace(signedIn(parent, true))).toBe('account');
  });
});
