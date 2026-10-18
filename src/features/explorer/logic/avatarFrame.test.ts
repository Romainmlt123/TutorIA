import { MAP_AVATAR_SHADOW, MAP_SCALE, MAP_SCALE_RATIO } from '../stylized3d/avatarChoreo';
import { SUN_DIRECTION } from '../stylized3d/sun';
import { AVATAR_VIEW, avatarFrame, avatarShadow } from './avatarFrame';

const SIN = Math.sin((52 * Math.PI) / 180);
const COS = Math.cos((52 * Math.PI) / 180);

describe('vue 3D de l’avatar dans la carte pré-rendue', () => {
  // 411 dp de large : 102,75 dp par mètre ; écran à 2,625 pixels par dp.
  const k = 411 / 4;
  const ratio = 2.625;
  const frame = avatarFrame(k, ratio);
  const isWholePixel = (dp: number) => Math.abs(dp * ratio - Math.round(dp * ratio)) < 1e-9;

  it('couvre à peu près la zone voulue autour des pieds', () => {
    expect(frame.width / k).toBeCloseTo(AVATAR_VIEW.width, 1);
    expect(frame.height / k).toBeCloseTo(AVATAR_VIEW.above + AVATAR_VIEW.below, 1);
  });

  it('tombe sur des pixels entiers, les pieds sur un coin de pixel au milieu de la largeur', () => {
    [frame.width, frame.height, frame.left, frame.top].forEach((dp) =>
      expect(isWholePixel(dp)).toBe(true),
    );
    expect(frame.left).toBeCloseTo(-frame.width / 2);
    expect(-frame.top / k).toBeGreaterThanOrEqual(AVATAR_VIEW.above);
  });

  it('a une caméra orthographique à l’échelle exacte de la carte', () => {
    const { frustum } = frame;
    expect((frustum.right - frustum.left) * k).toBeCloseTo(frame.width, 9);
    expect((frustum.top - frustum.bottom) * k).toBeCloseTo(frame.height, 9);
    // Les pieds (origine de la scène) sont au point d'ancrage de la vue.
    expect(-frustum.left * k).toBeCloseTo(-frame.left, 9);
    expect(frustum.top * k).toBeCloseTo(-frame.top, 9);
  });

  it('réduit le cadre et l’ombre en proportion de la figurine', () => {
    expect(MAP_SCALE).toBe(0.5);
    expect(AVATAR_VIEW).toEqual({
      width: 1.2 * MAP_SCALE_RATIO,
      above: 1.25 * MAP_SCALE_RATIO,
      below: 0.35 * MAP_SCALE_RATIO,
    });
    expect(MAP_AVATAR_SHADOW).toEqual({
      radius: 0.28 * MAP_SCALE_RATIO,
      height: 0.6 * MAP_SCALE_RATIO,
    });
  });
});

describe('ombre de contact de l’avatar', () => {
  const k = 100;
  const shadow = avatarShadow(k);

  it('tombe à l’opposé du soleil cuit, comme les ombres de la carte 3D', () => {
    const [sx, sy, sz] = SUN_DIRECTION;
    const centerX = shadow.left + shadow.size / 2;
    const centerY = shadow.top + shadow.size / 2;
    // groundShadows : décalage de 0,35 m par mètre de hauteur, tache posée à 0,04 m.
    expect(centerX).toBeCloseTo((-sx / sy) * 0.35 * MAP_AVATAR_SHADOW.height * k);
    expect(centerY).toBeCloseTo(
      ((-sz / sy) * 0.35 * MAP_AVATAR_SHADOW.height * SIN - 0.04 * COS) * k,
    );
  });

  it('s’écrase sur le sol vu à 52°', () => {
    expect(shadow.scaleY).toBeCloseTo(SIN / 1.15);
    expect(shadow.size).toBeGreaterThan(0);
    expect(shadow.blur).toBeGreaterThan(0);
  });
});
