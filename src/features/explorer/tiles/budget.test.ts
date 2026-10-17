import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

import { nodeSprites, PRERENDERED_MAPS } from '.';

/*
 * Budgets des cartes pré-rendues, lus dans les fichiers : en test, une image importée n'est qu'un
 * nombre, on suit donc les `require` des modules générés jusqu'aux fichiers eux-mêmes.
 */

/** Poids d'une région (tuiles, sous-couche et tronçons du chemin), nombre de tuiles, poids des sprites. */
const REGION_MAX_BYTES = 2_000_000;
const REGION_MAX_TILES = 100;
const SPRITES_MAX_BYTES = 150_000;

/** Fichiers importés par un module généré de ce dossier, en chemins absolus. */
function requiredFiles(module: string): string[] {
  const source = readFileSync(join(__dirname, module), 'utf8');
  return [...source.matchAll(/require\('([^']+)'\)/g)].map((match) =>
    resolve(__dirname, match[1]!),
  );
}

const totalBytes = (files: readonly string[]) =>
  files.reduce((sum, file) => sum + statSync(file).size, 0);

describe.each(Object.entries(PRERENDERED_MAPS))('carte pré-rendue %s', (regionId, tiles) => {
  const files = requiredFiles(`${regionId}.generated.ts`);

  it('importe ses tuiles, sa sous-couche et ses tronçons, et rien d’autre', () => {
    expect(files).toHaveLength(tiles!.tiles.length + 1 + tiles!.doneSegments.length);
    expect(files.filter((file) => !existsSync(file))).toEqual([]);
  });

  it('ne laisse aucune image de la région sans usage', () => {
    const folder = dirname(files[0]!);
    expect(basename(folder)).toBe(regionId);
    const images = readdirSync(folder).filter((name) => name.endsWith('.webp'));
    expect(images.filter((name) => !files.includes(join(folder, name)))).toEqual([]);
  });

  it(`tient en ${REGION_MAX_TILES} tuiles et ${REGION_MAX_BYTES / 1e6} Mo`, () => {
    expect(tiles!.tiles.length).toBeLessThanOrEqual(REGION_MAX_TILES);
    expect(totalBytes(files)).toBeLessThanOrEqual(REGION_MAX_BYTES);
  });
});

describe('sprites des points de niveau', () => {
  const files = requiredFiles('sprites.generated.ts');

  it('importe un fichier existant par sprite, et aucune image du dossier n’est sans usage', () => {
    // Toutes les clés sont des sprites, sauf l'échelle (ppm).
    expect(files).toHaveLength(Object.keys(nodeSprites).length - 1);
    expect(files.filter((file) => !existsSync(file))).toEqual([]);
    const folder = dirname(files[0]!);
    const images = readdirSync(folder).filter((name) => name.endsWith('.webp'));
    expect(images.filter((name) => !files.includes(join(folder, name)))).toEqual([]);
  });

  it(`tiennent en ${SPRITES_MAX_BYTES / 1000} ko`, () => {
    expect(totalBytes(files)).toBeLessThanOrEqual(SPRITES_MAX_BYTES);
  });
});
