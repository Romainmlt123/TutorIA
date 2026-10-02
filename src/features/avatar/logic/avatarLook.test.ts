import { avatarArt } from '@/theme/avatarArt';

import {
  DEFAULT_LOOK,
  EYE_STYLES,
  HAIR_STYLES,
  MOUTH_STYLES,
  normalizeLook,
  randomLook,
} from './avatarLook';
import { avatarScale, EYE_HEIGHT, EYE_SPACING, faceParams } from './face';

describe('apparence d’un avatar', () => {
  it('reprend l’apparence par défaut pour un enregistrement vide ou illisible', () => {
    expect(normalizeLook(undefined)).toEqual(DEFAULT_LOOK);
    expect(normalizeLook('rouge')).toEqual(DEFAULT_LOOK);
    expect(normalizeLook([1, 2])).toEqual(DEFAULT_LOOK);
  });

  it('garde chaque champ valide et remplace seulement les autres', () => {
    const look = normalizeLook({
      skin: 7,
      hair: { style: 'boucles', color: 99 },
      eyes: { style: 'cyclope', color: 2, spacing: 2, height: -1 },
      mouth: 'rire',
      cheeks: 'oui',
      outfit: { top: { item: 'armure', color: 3 } },
    });
    expect(look.skin).toBe(7);
    expect(look.hair).toEqual({ style: 'boucles', color: DEFAULT_LOOK.hair.color });
    expect(look.eyes).toEqual({ style: DEFAULT_LOOK.eyes.style, color: 2, spacing: 1, height: 0 });
    expect(look.mouth).toBe('rire');
    expect(look.cheeks).toBe(DEFAULT_LOOK.cheeks);
    expect(look.outfit.top).toEqual({ item: 'tshirt', color: 3 });
    expect(look.outfit.shoes).toEqual(DEFAULT_LOOK.outfit.shoes);
  });

  it('refuse les rangs de couleur non entiers ou hors palette', () => {
    expect(normalizeLook({ skin: 1.5 }).skin).toBe(DEFAULT_LOOK.skin);
    expect(normalizeLook({ skin: avatarArt.skins.length }).skin).toBe(DEFAULT_LOOK.skin);
    expect(normalizeLook({ skin: -1 }).skin).toBe(DEFAULT_LOOK.skin);
  });

  it('tire toujours la même apparence pour une graine, et une apparence valide', () => {
    expect(randomLook(4)).toEqual(randomLook(4));
    expect(randomLook(4)).not.toEqual(randomLook(5));
    for (let seed = 0; seed < 50; seed++) {
      const look = randomLook(seed);
      expect(normalizeLook(look)).toEqual(look);
    }
  });

  it('varie les coiffures et les bouches d’une graine à l’autre', () => {
    const looks = Array.from({ length: 60 }, (_, seed) => randomLook(seed));
    expect(new Set(looks.map((l) => l.hair.style)).size).toBe(HAIR_STYLES.length);
    expect(new Set(looks.map((l) => l.mouth)).size).toBe(MOUTH_STYLES.length);
  });
});

describe('réglages du visage pour le shader', () => {
  it('traduit les formes en rangs et les curseurs en positions', () => {
    const params = faceParams({
      ...DEFAULT_LOOK,
      eyes: { ...DEFAULT_LOOK.eyes, style: 'endormi', spacing: 0, height: 1 },
    });
    expect(params.eyeStyle).toBe(EYE_STYLES.indexOf('endormi'));
    expect(params.eyeSpacing).toBe(EYE_SPACING[0]);
    expect(params.eyeHeight).toBe(EYE_HEIGHT[1]);
    expect(params.cheeks).toBe(1);
    expect(params.freckles).toBe(0);
  });

  it('met la figurine moyenne à l’échelle 1', () => {
    expect(avatarScale({ ...DEFAULT_LOOK, size: 0.5 })).toBeCloseTo(1);
  });
});
