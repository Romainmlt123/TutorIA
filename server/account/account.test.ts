/**
 * @jest-environment node
 */
import type { AdminClient } from '../supabase';
import { handleDeleteAccount } from './account';
import { handleConsentRequest } from './consent';
import { handleCreateLinkCode, handleRedeemLinkCode, type AccountDeps } from './linkCodes';

type Profile = { role: 'student' | 'parent'; first_name: string | null } | null;

type FakeOptions = {
  profile?: Profile;
  email?: string;
  rpc?: Record<string, (args: Record<string, unknown>) => unknown>;
};

/** Faux client Supabase : jeton « good » valide, profil configurable, RPC simulées. */
function fakeAdmin({
  profile = { role: 'student', first_name: 'Léa' },
  email = 'lea@exemple.fr',
  rpc = {},
}: FakeOptions = {}) {
  const query = {
    select: () => query,
    eq: () => query,
    limit: () => query,
    maybeSingle: async () => ({ data: profile, error: null }),
    upsert: jest.fn(async () => ({ error: null })),
  };
  const admin = {
    auth: {
      getClaims: jest.fn(async (token: string) =>
        token === 'good'
          ? { data: { claims: { sub: 'user-1', email } }, error: null }
          : { data: null, error: new Error('invalid JWT') },
      ),
      getUser: jest.fn(async (token: string) =>
        token === 'good'
          ? { data: { user: { id: 'user-1', email } }, error: null }
          : { data: { user: null }, error: new Error('invalid JWT') },
      ),
      admin: {
        deleteUser: jest.fn(async () => ({ error: null })),
        inviteUserByEmail: jest.fn(async () => ({
          data: { user: { id: 'parent-new' } },
          error: null,
        })),
      },
    },
    from: jest.fn(() => query),
    rpc: jest.fn(async (name: string, args: Record<string, unknown>) => {
      if (name === 'consume_rate_limit') return { data: rpc[name]?.(args) ?? true, error: null };
      return { data: rpc[name]?.(args) ?? null, error: null };
    }),
  };
  return { admin, query };
}

function deps(admin: unknown, generateCode?: () => string): AccountDeps {
  return { admin: () => admin as AdminClient, pepper: () => 'ab'.repeat(32), generateCode };
}

function post(path: string, body: unknown, token: string | null = 'good') {
  return new Request(`http://localhost${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

describe('user check', () => {
  it('refuses a request without a token', async () => {
    const { admin } = fakeAdmin();
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '482913' }, null),
      deps(admin),
    );
    expect(response.status).toBe(401);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it('refuses an invalid token', async () => {
    const { admin } = fakeAdmin();
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '482913' }, 'forged'),
      deps(admin),
    );
    expect(response.status).toBe(401);
  });

  it('refuses a valid token whose account was deleted', async () => {
    const { admin } = fakeAdmin({ profile: null });
    const response = await handleDeleteAccount(post('/api/account/delete', {}), deps(admin));
    expect(response.status).toBe(401);
    expect(admin.auth.admin.deleteUser).not.toHaveBeenCalled();
  });

  it('checks sensitive actions against Supabase Auth', async () => {
    const { admin } = fakeAdmin();
    const response = await handleDeleteAccount(post('/api/account/delete', {}), deps(admin));
    expect(response.status).toBe(200);
    expect(admin.auth.getUser).toHaveBeenCalledWith('good');
    expect(admin.auth.admin.deleteUser).toHaveBeenCalledWith('user-1');
  });
});

describe('POST /api/link-codes/create', () => {
  it('is reserved to parents', async () => {
    const { admin } = fakeAdmin();
    const response = await handleCreateLinkCode(
      post('/api/link-codes/create', { childFirstName: 'Léa', childGrade: '4e' }),
      deps(admin),
    );
    expect(response.status).toBe(403);
  });

  it('draws a new code after a collision and never stores it in clear', async () => {
    let calls = 0;
    const { admin } = fakeAdmin({
      profile: { role: 'parent', first_name: 'Claire' },
      rpc: {
        create_link_code: () => {
          calls += 1;
          return calls === 1
            ? [{ status: 'collision', expires_at: null }]
            : [{ status: 'created', expires_at: '2026-09-29T10:00:00.000Z' }];
        },
      },
    });
    const codes = ['111111', '482913'];
    const response = await handleCreateLinkCode(
      post('/api/link-codes/create', { childFirstName: '  Léa ', childGrade: '4e' }),
      deps(admin, () => codes.shift() ?? '000000'),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      code: '482913',
      expiresAt: '2026-09-29T10:00:00.000Z',
    });
    const createCalls = admin.rpc.mock.calls.filter(([name]) => name === 'create_link_code');
    expect(createCalls).toHaveLength(2);
    for (const [, args] of createCalls) {
      expect(args.p_child_first_name).toBe('Léa');
      expect(args.p_code_hmac).toMatch(/^[0-9a-f]{64}$/);
      expect(JSON.stringify(args)).not.toContain('482913');
    }
  });
});

describe('POST /api/link-codes/redeem', () => {
  it('refuses a malformed code without calling the database', async () => {
    const { admin } = fakeAdmin();
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '12ab' }),
      deps(admin),
    );
    expect(response.status).toBe(422);
    expect(admin.rpc).not.toHaveBeenCalled();
  });

  it('stops after too many attempts', async () => {
    const { admin } = fakeAdmin({ rpc: { consume_rate_limit: () => false } });
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '482913' }),
      deps(admin),
    );
    expect(response.status).toBe(429);
    expect(admin.rpc.mock.calls.some(([name]) => name === 'redeem_link_code')).toBe(false);
  });

  it('links the accounts with a valid code', async () => {
    const { admin } = fakeAdmin({
      rpc: { redeem_link_code: () => [{ status: 'linked', parent_id: 'p1' }] },
    });
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '482 913' }),
      deps(admin),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'linked' });
  });

  it('explains a code made for another first name', async () => {
    const { admin } = fakeAdmin({
      rpc: { redeem_link_code: () => [{ status: 'name_mismatch', parent_id: null }] },
    });
    const response = await handleRedeemLinkCode(
      post('/api/link-codes/redeem', { code: '482913' }),
      deps(admin),
    );
    expect(await response.json()).toEqual({ error: 'name_mismatch' });
  });
});

describe('POST /api/consent/request', () => {
  it('refuses the student address as parent address', async () => {
    const { admin } = fakeAdmin();
    const response = await handleConsentRequest(
      post('/api/consent/request', { parentEmail: 'LEA@exemple.fr' }),
      deps(admin),
    );
    expect(await response.json()).toEqual({ error: 'same_email' });
  });

  it('invites an unknown parent and records the request', async () => {
    const { admin, query } = fakeAdmin({ rpc: { find_account_by_email: () => [] } });
    const response = await handleConsentRequest(
      post('/api/consent/request', { parentEmail: 'claire@exemple.fr' }),
      deps(admin),
    );
    expect(response.status).toBe(200);
    expect(admin.auth.admin.inviteUserByEmail).toHaveBeenCalledWith('claire@exemple.fr', {
      data: { role: 'parent' },
    });
    expect(query.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ student_id: 'user-1', parent_id: 'parent-new' }),
      { onConflict: 'student_id' },
    );
  });

  it('answers the same way for a student address, without sending anything', async () => {
    const { admin, query } = fakeAdmin({
      rpc: { find_account_by_email: () => [{ id: 'other', role: 'student' }] },
    });
    const response = await handleConsentRequest(
      post('/api/consent/request', { parentEmail: 'tom@exemple.fr' }),
      deps(admin),
    );
    expect(await response.json()).toEqual({ ok: true });
    expect(admin.auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
    expect(query.upsert).not.toHaveBeenCalled();
  });
});
