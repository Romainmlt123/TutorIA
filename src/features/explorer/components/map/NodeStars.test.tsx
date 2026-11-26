import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { CELEBRATION, planCelebration } from '../../logic/celebration';
import { NodeStars, type StarPop } from './NodeStars';

/** Valeur partagée figée (la doublure de Reanimated calcule chaque style une fois, au rendu). */
const fixed = <T,>(value: T) => ({ value, get: () => value }) as unknown as SharedValue<T>;

/** Un niveau terminé pour la première fois avec 3 étoiles. */
const [MOMENTS] = planCelebration({
  stars: [{ levelId: 'lecon', from: 0, to: 3, firstTime: true }],
  gaps: [],
  unlocked: [],
  cities: [],
}).stars;

const popAt = (t: number): StarPop => ({ clock: fixed(t), row: MOMENTS!.row, pops: MOMENTS!.pops });

type Style = { opacity?: number; transform?: { scale?: number }[] };

/** La rangée, puis l'échelle de l'étoile d'or de chaque rang (de gauche à droite). */
async function starsAt(t: number) {
  const { container } = await render(<NodeStars stars={3} pop={popAt(t)} />);
  const styled = container
    .queryAll((n) => n.type === 'View')
    .map((n) => StyleSheet.flatten(n.props.style) as Style | undefined);
  const row = styled.find((style) => style?.opacity !== undefined && style.transform)!;
  const golds = styled
    .filter((style) => style?.transform && style.opacity === undefined)
    .map((style) => style!.transform![0]!.scale);
  return { row, golds };
}

describe('étoiles d’un niveau, au retour sur la carte', () => {
  it('avant leur heure : rangée cachée, aucune étoile d’or', async () => {
    const { row, golds } = await starsAt(0);
    expect(row.opacity).toBe(0);
    expect(golds).toEqual([0, 0, 0]);
  });

  it('jaillissent une à une, de gauche à droite, celle du milieu en dernier', async () => {
    const [left, right, middle] = MOMENTS!.pops;
    expect([left!.slot, right!.slot, middle!.slot]).toEqual([0, 2, 1]);
    // La gauche est posée, la droite jaillit, celle du milieu attend encore.
    const { golds } = await starsAt(right!.at + 0.2);
    expect(golds[0]).toBe(1);
    expect(golds[2]).toBeGreaterThan(0);
    expect(golds[1]).toBe(0);
  });

  it('à la fin, toutes les étoiles gagnées sont posées à leur taille', async () => {
    const { row, golds } = await starsAt(MOMENTS!.pops[2]!.at + CELEBRATION.starPop);
    expect(row.opacity).toBe(1);
    expect(golds).toEqual([1, 1, 1]);
  });
});
