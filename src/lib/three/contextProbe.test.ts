import { isContextDead, PROBE_EXTENSION } from './contextProbe';

/** Contexte factice : `getExtension` répond comme expo-gl, et retient les noms demandés. */
function contextAnswering(answer: unknown) {
  const asked: string[] = [];
  return {
    asked,
    getExtension: (name: string) => {
      asked.push(name);
      return answer;
    },
  };
}

describe('contexte 3D détruit (expo-gl)', () => {
  it('voit un contexte vivant : expo-gl répond null pour une extension inconnue', () => {
    expect(isContextDead(contextAnswering(null))).toBe(false);
  });

  it('voit un contexte détruit : expo-gl répond undefined à tout appel', () => {
    expect(isContextDead(contextAnswering(undefined))).toBe(true);
  });

  it('demande une extension qui n’existe dans aucun pilote', () => {
    const context = contextAnswering(null);
    isContextDead(context);
    expect(context.asked).toEqual([PROBE_EXTENSION]);
    expect(PROBE_EXTENSION).not.toMatch(/^(WEBGL|EXT|OES|ANGLE|KHR)_/);
  });
});
