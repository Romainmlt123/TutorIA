import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import { mapArt } from '@/theme/mapArt';

import type { CloudField, Glint } from '../../logic/ambientLayout';
import { cloudShift, glintAt } from '../../logic/mapAmbient';
import { imageV } from '../../logic/mapProjection';
import { MapClouds, WaterGlints } from './MapAmbient';

/** Rendu dont le coin haut gauche est en (−2, −1) du plan image ; 100 dp par mètre. */
const ORIGIN = { x0: -2, v0: -1 };
const K = 100;
/** Horloge figée à `t` secondes (la doublure de Reanimated calcule chaque style une fois). */
const clockAt = (t: number) => ({ value: t }) as SharedValue<number>;

const styleOf = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style as never) as Record<string, unknown>;

describe('reflets du soleil sur l’eau', () => {
  const glint: Glint = { x: 0.5, z: 1, length: 0.07, group: 0 };

  async function glintStyle(t: number) {
    const { container } = await render(
      <WaterGlints glints={[glint]} surface={0.1} origin={ORIGIN} k={K} clock={clockAt(t)} />,
    );
    return styleOf(container.queryAll((n) => n.type === 'View')[0]!);
  }

  it('pose le reflet sur son point de l’eau, centré, dans la lueur de l’eau', async () => {
    const style = await glintStyle(0);
    const width = 0.07 * K;
    expect(style.width).toBeCloseTo(width, 9);
    expect(style.left).toBeCloseTo((0.5 + 2) * K - width / 2, 9);
    expect(style.top as number).toBeCloseTo(
      (imageV(1, 0.1) + 1) * K - (style.height as number) / 2,
      9,
    );
    expect(style.backgroundColor).toBe(mapArt.glint);
    expect(style.boxShadow).toMatch(new RegExp(`^0px 0px [\\d.]+px [\\d.]+px ${mapArt.glint}$`));
  });

  it('l’éteint sans rien d’autre à mettre à jour, puis le fait briller et glisser', async () => {
    // Groupe 0 : éteint de 35 % à 100 % de sa période de 2,2 s, au plus fort à 17,5 %.
    expect(await glintStyle(1.5)).toMatchObject({ opacity: 0 });
    expect((await glintStyle(1.5)).transform).toBeUndefined();
    const lit = await glintStyle(0.385);
    const state = glintAt(0.385, 0);
    expect(lit.opacity).toBeCloseTo(state.opacity, 9);
    expect(lit.transform).toEqual([
      { translateX: state.dx * K },
      { translateY: state.dv * K },
      { scale: state.scale },
    ]);
  });
});

describe('nuages sous l’île', () => {
  const field: CloudField = {
    clouds: [
      {
        x: 1,
        v: 2,
        speed: 0.1,
        halfWidth: 1.5,
        halfHeight: 0.5,
        puffs: [
          { dx: -0.5, dv: 0.1, width: 0.6, height: 0.3, spread: 0.1, blur: 0.2, tone: 'shade' },
          { dx: 0.5, dv: -0.1, width: 0.5, height: 0.2, spread: 0.1, blur: 0.2, tone: 'lit' },
        ],
      },
    ],
    wrap: [-4, 6],
  };

  async function cloudViews(t: number) {
    const { container } = await render(
      <MapClouds field={field} origin={ORIGIN} k={K} clock={clockAt(t)} />,
    );
    return container.queryAll((n) => n.type === 'View').map(styleOf);
  }

  it('pose le nuage à sa place, ses bouffées dedans, dessous bleuté puis dessus éclairé', async () => {
    const [cloud, shade, lit] = await cloudViews(0);
    expect(cloud).toMatchObject({ left: 150, top: 250, width: 300, height: 100 });
    expect(shade).toMatchObject({ left: 70, top: 45, width: 60, height: 30, borderRadius: 15 });
    expect(shade!.backgroundColor).toBe(mapArt.cloud.shade);
    expect(shade!.boxShadow).toBe(`0px 0px 20px 10px ${mapArt.cloud.shade}`);
    expect(lit!.backgroundColor).toBe(mapArt.cloud.lit);
  });

  it('le fait dériver avec l’horloge, puis revenir à gauche', async () => {
    expect((await cloudViews(0))[0]!.transform).toEqual([{ translateX: 0 }]);
    for (const t of [20, 60]) {
      expect((await cloudViews(t))[0]!.transform).toEqual([
        { translateX: cloudShift(t, 1, 0.1, -4, 6) * K },
      ]);
    }
    // Au bout de 60 s, parti de x = 1 à 0,1 m/s, il est sorti à droite (x = 6) et revenu en x = −3.
    expect(cloudShift(60, 1, 0.1, -4, 6)).toBeCloseTo(-4, 9);
  });
});
