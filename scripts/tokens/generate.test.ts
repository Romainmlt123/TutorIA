import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  buildTokens,
  createColorResolver,
  generateTokensModule,
  parseGradient,
  type AppTokens,
  type DesignTokens,
} from './generate';

const root = join(__dirname, '..', '..');
const readJson = <T>(path: string): T => JSON.parse(readFileSync(join(root, path), 'utf8')) as T;
const design = readJson<DesignTokens>('design/tokens/tokens.json');
const app = readJson<AppTokens>('design/tokens/app-tokens.json');

describe('générateur de tokens', () => {
  it('produit exactement le fichier versionné (lancer « npm run tokens » sinon)', () => {
    const committed = readFileSync(join(root, 'src/theme/tokens.generated.ts'), 'utf8');
    expect(generateTokensModule(design, app)).toBe(committed);
  });

  it('résout les alias en chaîne et refuse les alias inconnus', () => {
    const resolve = createColorResolver([
      { name: 'blue-500', value: '#2E6BE6' },
      { name: 'brand', value: '{blue-500}' },
      { name: 'primary', value: '{brand}' },
    ]);
    expect(resolve('{primary}')).toBe('#2e6be6');
    expect(() => resolve('{inconnu}')).toThrow('Alias inconnu');
  });

  it('lit les positions des dégradés et complète celles qui manquent', () => {
    const resolve = createColorResolver([]);
    expect(parseGradient(['#e95555', '#c21a1a 60%', '#980b0b'], resolve)).toEqual({
      colors: ['#e95555', '#c21a1a', '#980b0b'],
      locations: [0, 0.6, 1],
    });
    expect(parseGradient(['#000000', '#111111', '#222222'], resolve).locations).toEqual([
      0, 0.5, 1,
    ]);
  });

  it('relie les rôles, les matières et les références entre tokens', () => {
    const tokens = buildTokens(design, app);
    expect(tokens.colors.bg).toBe(tokens.palette.gray?.['100']);
    expect(tokens.colors.primary).toBe('#2e6be6');
    expect(tokens.kpi.sessions).toEqual(tokens.subjects.anglais?.gradient);
    expect(tokens.kpi.record).toEqual({ background: '#e6992e', text: '#ffffff' });
    expect(tokens.navigation).toMatchObject({
      radius: 24,
      activeBubble: 52,
      activeBubbleTutor: 60,
    });
    expect(tokens.typeScale.display).toMatchObject({ fontSize: 48, letterSpacing: -0.96 });
  });

  it("résout les tokens de l'espace Parents", () => {
    const tokens = buildTokens(design, app);
    expect(tokens.hero.gradient).toEqual({
      colors: ['#2e6be6', '#1750c4', '#3b0da2'],
      locations: [0, 0.5, 1],
    });
    expect(tokens.statuses.acquired).toEqual({
      label: 'Acquis',
      background: tokens.palette.green?.['700'],
      text: '#ffffff',
    });
    expect(tokens.statuses.sessionOutcome).toEqual({
      understood: 'acquired',
      progressing: 'inProgress',
      toReview: 'toConsolidate',
    });
    expect(tokens.settingTiles.voice).toEqual(tokens.subjects.francais?.gradient);
    expect(tokens.settingTiles.alerts?.colors).toEqual(['#e6992e', '#e6992e']);
  });
});
