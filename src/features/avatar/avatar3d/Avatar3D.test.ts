import { DEFAULT_LOOK, type AvatarLook } from '../logic/avatarLook';

import { visiblePieces } from './visiblePieces';

function outfitLook(
  top: 'tshirt' | 'sweat',
  bottom: 'short' | 'pantalon' | 'jupe' | 'salopette',
): AvatarLook {
  return {
    ...DEFAULT_LOOK,
    outfit: {
      ...DEFAULT_LOOK.outfit,
      top: { ...DEFAULT_LOOK.outfit.top, item: top },
      bottom: { ...DEFAULT_LOOK.outfit.bottom, item: bottom },
    },
  };
}

function bodyZones(top: 'tshirt' | 'sweat', bottom: 'short' | 'pantalon' | 'jupe' | 'salopette') {
  const look = outfitLook(top, bottom);
  return [...visiblePieces(look)].filter((name) => name.startsWith('corps-')).sort();
}

describe('zones visibles de la figurine', () => {
  it('montre les zones découvertes avec un t-shirt et un short', () => {
    expect(bodyZones('tshirt', 'short')).toEqual([
      'corps-avant-bras',
      'corps-bras-haut',
      'corps-mollet',
    ]);
  });

  it('laisse les cuisses et les mollets visibles avec un sweat et une jupe', () => {
    expect(bodyZones('sweat', 'jupe')).toEqual(['corps-cuisse', 'corps-mollet', 'corps-torse-bas']);
  });

  it('masque aussi les mollets sous le pantalon et la salopette', () => {
    expect(bodyZones('tshirt', 'pantalon')).toEqual(['corps-avant-bras', 'corps-bras-haut']);
    expect(bodyZones('tshirt', 'salopette')).toEqual(['corps-avant-bras', 'corps-bras-haut']);
  });
});
