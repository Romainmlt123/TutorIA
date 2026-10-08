/**
 * @jest-environment node
 */
import type { AdminClient } from '../supabase';
import { handleVisualCheck } from './visualCheck';

const graph = {
  title: '3x + 5 = 20',
  description: 'La droite y = 3x + 5 croise la droite y = 20 en x = 5.',
  x_min: -1,
  x_max: 7,
  y_min: -2,
  y_max: 30,
  curves: [{ expression: '3x + 5', color: 'rouge', dashed: false, label: 'y = 3x + 5' }],
  points: [{ x: 5, y: 20, color: 'rouge', label: 'x = 5', highlight: true }],
};

function adminWith(visualsEnabled: boolean) {
  return {
    auth: { getClaims: async () => ({ data: { claims: { sub: 'student-1' } }, error: null }) },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { role: 'student', first_name: 'Léa' }, error: null }),
        }),
      }),
    }),
    rpc: async (name: string) =>
      name === 'consume_rate_limit'
        ? { data: true, error: null }
        : {
            data: [
              {
                consent_status: 'granted',
                voice_enabled: true,
                camera_enabled: true,
                visuals_enabled: visualsEnabled,
                evening_pause: false,
                daily_limit_enabled: false,
                daily_limit_minutes: 90,
                allowed_from: '00:00:00',
                allowed_until: '23:59:00',
                today_seconds: 0,
              },
            ],
            error: null,
          },
  } as unknown as AdminClient;
}

const moderation = (flagged: boolean) => ({
  moderations: { create: async () => ({ results: [{ flagged, categories: {} }] }) },
});

function check(body: unknown, { visuals = true, flagged = false } = {}) {
  const request = new Request('http://localhost/api/tutor/visual-check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer good' },
    body: JSON.stringify(body),
  });
  return handleVisualCheck(request, {
    admin: () => adminWith(visuals),
    openai: () => moderation(flagged) as never,
  });
}

describe('POST /api/tutor/visual-check · visuels pendant un appel vocal', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  it('valide et modère le visuel demandé par le tuteur, puis le renvoie prêt à dessiner', async () => {
    const response = await check({ name: 'show_graph', arguments: JSON.stringify(graph) });
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      visual: { kind: 'graph', title: '3x + 5 = 20', xRange: [-1, 7] },
    });
  });

  it('refuse un visuel si le parent les a désactivés', async () => {
    const response = await check(
      { name: 'show_graph', arguments: JSON.stringify(graph) },
      { visuals: false },
    );
    expect(await response.json()).toEqual({ error: 'not_allowed' });
  });

  it('refuse un outil inconnu, un visuel mal formé ou signalé par la modération', async () => {
    expect((await check({ name: 'run_code', arguments: '{}' })).status).toBe(400);
    expect((await check({ name: 'show_graph', arguments: '{"x_min":"a"}' })).status).toBe(400);
    const flagged = await check(
      { name: 'show_graph', arguments: JSON.stringify(graph) },
      { flagged: true },
    );
    expect(await flagged.json()).toEqual({ error: 'flagged' });
  });
});
