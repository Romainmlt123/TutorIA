import { fr } from '@/i18n/fr';

import { DEFAULT_LOOK, normalizeLook, randomLook } from './avatarLook';
import {
  EDITOR_CONTROLS,
  EDITOR_TABS,
  nudge,
  sameLook,
  snap,
  starterLook,
  TAB_FRAMING,
  type EditorControl,
} from './editor';

const ALL_CONTROLS: EditorControl[] = EDITOR_TABS.flatMap((tab) => [...EDITOR_CONTROLS[tab]]);

describe('réglages de l’éditeur d’avatar', () => {
  it('donne à chaque onglet au moins un réglage et un cadrage', () => {
    for (const tab of EDITOR_TABS) {
      expect(EDITOR_CONTROLS[tab].length).toBeGreaterThan(0);
      expect(['face', 'body']).toContain(TAB_FRAMING[tab]);
    }
  });

  it('a un libellé pour chaque réglage, chaque forme et chaque bout de curseur', () => {
    for (const control of ALL_CONTROLS) {
      expect(fr.avatar.controls[control.id]).toBeTruthy();
      if (control.kind === 'shape') {
        const labels: Readonly<Record<string, string>> = fr.avatar.shapes[control.id];
        for (const option of control.options) expect(labels[option]).toBeTruthy();
      }
      if (control.kind === 'slider') expect(fr.avatar.sliders[control.id].more).toBeTruthy();
    }
  });

  it('relit la valeur qu’il vient d’écrire, et rend toujours une apparence valide', () => {
    const look = randomLook(12);
    for (const control of ALL_CONTROLS) {
      let next = look;
      if (control.kind === 'shape') {
        const option = control.options[control.options.length - 1]!;
        next = control.set(look, option);
        expect(control.value(next)).toBe(option);
      } else if (control.kind === 'color') {
        next = control.set(look, control.palette.length - 1);
        expect(control.value(next)).toBe(control.palette.length - 1);
      } else if (control.kind === 'slider') {
        next = control.set(look, 0.7);
        expect(control.value(next)).toBeCloseTo(0.7);
      } else {
        next = control.set(look, !control.value(look));
        expect(control.value(next)).toBe(!control.value(look));
      }
      expect(normalizeLook(next)).toEqual(next);
    }
  });

  it('ignore une forme inconnue ou une couleur hors palette', () => {
    for (const control of ALL_CONTROLS) {
      if (control.kind === 'shape') expect(control.set(DEFAULT_LOOK, 'cyclope')).toBe(DEFAULT_LOOK);
      if (control.kind === 'color') {
        expect(control.set(DEFAULT_LOOK, control.palette.length)).toBe(DEFAULT_LOOK);
        expect(control.set(DEFAULT_LOOK, 1.5)).toBe(DEFAULT_LOOK);
      }
    }
  });

  it('ne touche qu’à son propre champ', () => {
    const skin = EDITOR_CONTROLS.corps.find((c) => c.id === 'skin')!;
    if (skin.kind !== 'color') throw new Error('skin doit être une couleur');
    const next = skin.set(DEFAULT_LOOK, 9);
    expect({ ...next, skin: DEFAULT_LOOK.skin }).toEqual(DEFAULT_LOOK);
  });
});

describe('curseurs à crans', () => {
  it('ramène une valeur au cran le plus proche, entre 0 et 1', () => {
    expect(snap(0.44)).toBe(0.4);
    expect(snap(0.46)).toBe(0.5);
    expect(snap(-3)).toBe(0);
    expect(snap(7)).toBe(1);
  });

  it('avance ou recule d’un cran, sans dépasser les bouts', () => {
    expect(nudge(0.5, 1)).toBe(0.6);
    expect(nudge(0.5, -1)).toBe(0.4);
    expect(nudge(1, 1)).toBe(1);
    expect(nudge(0, -1)).toBe(0);
    expect(nudge(0.33, 1)).toBe(0.4);
  });
});

describe('apparence de départ et changements', () => {
  it('reconnaît deux apparences identiques, quel que soit l’ordre des champs', () => {
    const look = randomLook(3);
    const { outfit, ...rest } = look;
    const reordered = { outfit, ...rest };
    expect(sameLook(look, reordered)).toBe(true);
    expect(sameLook(look, { ...look, freckles: !look.freckles })).toBe(false);
  });

  it('propose toujours la même figurine de départ à un compte, et une autre à un autre compte', () => {
    expect(starterLook('eleve-1')).toEqual(starterLook('eleve-1'));
    expect(starterLook('eleve-1')).not.toEqual(starterLook('eleve-2'));
    expect(normalizeLook(starterLook('eleve-1'))).toEqual(starterLook('eleve-1'));
  });

  it('donne toujours une figurine de départ souriante', () => {
    for (let k = 0; k < 200; k++) {
      const look = starterLook(`eleve-${k}`);
      expect(look.eyes.style).not.toBe('endormi');
      expect(look.mouth).not.toBe('neutre');
    }
  });
});
