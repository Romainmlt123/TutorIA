import { ISLANDS } from '../content';
import { paramsOf, upOf, viewFromParams } from './explorerView';

describe('vues de l’onglet Explorer', () => {
  it('ouvre le carrousel sans paramètre ou avec une île inconnue', () => {
    expect(viewFromParams({}, ISLANDS)).toEqual({ kind: 'carousel' });
    expect(viewFromParams({ ile: 'latin' }, ISLANDS)).toEqual({ kind: 'carousel' });
    expect(viewFromParams({ region: 'maths-nombres' }, ISLANDS)).toEqual({ kind: 'carousel' });
  });

  it('ouvre les régions d’une île, puis une région', () => {
    expect(viewFromParams({ ile: 'maths' }, ISLANDS)).toEqual({
      kind: 'regions',
      subjectId: 'maths',
    });
    expect(viewFromParams({ ile: 'maths', region: 'maths-espace' }, ISLANDS)).toEqual({
      kind: 'region',
      subjectId: 'maths',
      regionId: 'maths-espace',
    });
  });

  it('revient aux régions quand la région est inconnue, et lit une liste de paramètres', () => {
    expect(viewFromParams({ ile: 'maths', region: 'maths-lune' }, ISLANDS).kind).toBe('regions');
    expect(viewFromParams({ ile: ['maths', 'francais'], region: '' }, ISLANDS).kind).toBe(
      'regions',
    );
  });

  it('écrit la vue en paramètres et la relit à l’identique', () => {
    for (const params of [{}, { ile: 'maths' }, { ile: 'maths', region: 'maths-algo' }]) {
      const view = viewFromParams(params, ISLANDS);
      expect(viewFromParams(paramsOf(view), ISLANDS)).toEqual(view);
    }
    expect(paramsOf({ kind: 'carousel' })).toEqual({ ile: undefined, region: undefined });
  });

  it('remonte d’une vue à la fois, jusqu’au carrousel', () => {
    const region = { kind: 'region', subjectId: 'maths', regionId: 'maths-espace' } as const;
    expect(upOf(region)).toEqual({ kind: 'regions', subjectId: 'maths' });
    expect(upOf({ kind: 'regions', subjectId: 'maths' })).toEqual({ kind: 'carousel' });
    expect(upOf({ kind: 'carousel' })).toBeNull();
  });
});
