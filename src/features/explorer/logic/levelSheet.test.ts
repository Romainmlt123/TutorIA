import { demoLevelRecords } from '@/data/mock/explorer';

import { islandOf } from '../content';
import { lockOf, reviewLessonOf } from './levelSheet';
import { buildRegionMap } from './regionMap';

const maths = islandOf('maths')!;
const demo = buildRegionMap(
  maths,
  'maths-nombres',
  new Map(demoLevelRecords.map((r) => [r.levelId, r])),
)!;
const fresh = buildRegionMap(maths, 'maths-nombres', new Map())!;
const node = (map: typeof demo, levelId: string) => map.nodes.find((n) => n.levelId === levelId)!;

describe('fiche d’un niveau', () => {
  it('nomme les villes à terminer avant une ville fermée', () => {
    expect(lockOf(fresh, node(fresh, 'maths-equations.isoler-x'))).toEqual({
      kind: 'city',
      names: ['Ville du Calcul littéral'],
    });
  });

  it('compte les niveaux à terminer avant le Bilan (X3b)', () => {
    const equations = demo.nodes.filter((n) => n.cityId === 'maths-equations');
    const todo = equations.filter((n) => n.type !== 'evaluation' && n.state !== 'completed');
    expect(lockOf(demo, node(demo, 'maths-equations.bilan'))).toEqual({
      kind: 'bilan',
      remaining: todo.length,
    });
  });

  it('renvoie au premier niveau à terminer avant un niveau fermé', () => {
    const equations = demo.nodes.filter((n) => n.cityId === 'maths-equations');
    const active = equations.find((n) => n.state === 'active')!;
    const locked = equations.find((n) => n.state === 'locked' && n.type !== 'evaluation')!;
    expect(lockOf(demo, locked)).toEqual({
      kind: 'previous',
      type: active.type,
      title: active.title,
    });
    expect(lockOf(demo, active)).toBeNull();
  });

  it('propose de revoir la leçon qui précède des exercices, la première leçon après le Bilan', () => {
    expect(reviewLessonOf('maths-equations.resoudre-ax-b-c')?.title).toBe('Isoler x');
    expect(reviewLessonOf('maths-equations.isoler-x')?.title).toBe('Isoler x');
    expect(reviewLessonOf('maths-equations.bilan')?.title).toBe('Qu’est-ce qu’une équation ?');
  });
});
