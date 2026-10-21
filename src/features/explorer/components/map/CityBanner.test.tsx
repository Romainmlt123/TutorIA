import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { fr } from '@/i18n/fr';
import { mapArt } from '@/theme/mapArt';

import { CELEBRATION } from '../../logic/celebration';
import type { MapCity } from '../../logic/regionMap';
import { CityBanner } from './CityBanner';
import type { CityFlip } from './CityCelebration';

/** Valeur partagée figée (la doublure de Reanimated calcule chaque style une fois, au rendu). */
const fixed = <T,>(value: T) => ({ value, get: () => value }) as unknown as SharedValue<T>;

const CITY: MapCity = {
  id: 'maths-relatifs',
  name: 'Village des Relatifs',
  monument: 'relatifs',
  status: 'done',
  open: true,
  missing: [],
  recall: undefined,
  center: { x: 0, z: 0 },
  radius: 2,
  levelsDone: 7,
  levelsTotal: 7,
  stars: 18,
};

/** Retournement à l'heure 1 s, l'horloge figée à `t`. */
const flipAt = (t: number, change: Partial<CityFlip> = {}): CityFlip => ({
  clock: fixed(t),
  at: 1,
  from: 'current',
  to: 'done',
  ...change,
});

type Style = {
  opacity?: number;
  transform?: Record<string, number>[];
  backgroundColor?: string;
  borderColor?: string;
};
const styleOf = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as never) as Style | undefined;

async function banner(flip: CityFlip, city: MapCity = CITY, onPress = jest.fn()) {
  const { container } = await render(
    <CityBanner city={city} onPress={onPress} withStatus flip={flip} />,
  );
  return container;
}

/** Face de l'ancien état : la vue cachée aux lecteurs d'écran, posée devant le bouton. */
const frontOf = (container: Awaited<ReturnType<typeof banner>>) =>
  container.queryAll((n) => n.type === 'View' && n.props['aria-hidden'] === true)[0]!;

/** Confettis : les petites vues de leurs couleurs. */
const confettiOf = (container: Awaited<ReturnType<typeof banner>>) =>
  container.queryAll(
    (n) =>
      n.type === 'View' &&
      (mapArt.celebration.confetti as readonly string[]).includes(
        styleOf(n)?.backgroundColor ?? '',
      ),
  );

describe('bandeau d’une ville qui change d’état', () => {
  it('montre l’ancien état devant le bouton, qui annonce déjà le nouveau et reste touchable', async () => {
    const onPress = jest.fn();
    const container = await banner(flipAt(0), CITY, onPress);
    expect(styleOf(frontOf(container))?.opacity).toBe(1);
    const label = fr.explorer.cityBanner(CITY.name, fr.explorer.cityStatus.done);
    await fireEvent.press(screen.getByLabelText(label));
    expect(onPress).toHaveBeenCalled();
  });

  it('se retourne à son heure : l’ancien état disparaît, le nouveau se déplie', async () => {
    const container = await banner(flipAt(1 + CELEBRATION.cityFlip));
    expect(styleOf(frontOf(container))?.opacity).toBe(0);
    const back = container.queryAll(
      (n) => n.type === 'View' && styleOf(n)?.transform?.[0]?.scaleY !== undefined,
    );
    expect(back.map((n) => styleOf(n)!.transform![0]!.scaleY)).toContain(1);
  });

  it('une ville validée reçoit une pluie de confettis', async () => {
    expect(confettiOf(await banner(flipAt(1.2))).length).toBeGreaterThan(20);
  });

  it('une ville à consolider reçoit un anneau d’encouragement, sans confettis', async () => {
    const city = { ...CITY, status: 'consolidate' as const };
    const container = await banner(flipAt(1.3, { to: 'consolidate' }), city);
    expect(confettiOf(container)).toHaveLength(0);
    // L'anneau, posé derrière le bouton (du même orange que l'état « à consolider »).
    const ring = container.queryAll(
      (n) =>
        n.type === 'View' &&
        n.props.pointerEvents === 'none' &&
        styleOf(n)?.borderColor === mapArt.celebration.cue,
    );
    expect(ring).toHaveLength(1);
    expect(styleOf(ring[0]!)?.opacity).toBeGreaterThan(0);
  });
});
