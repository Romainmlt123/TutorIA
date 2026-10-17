import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

/*
 * Garde des fonds de la navigation. Sur Android, la scène d'Explorer, montée sous la pile de la
 * racine, se voit à travers l'espace élève et son onglet Explorer (`SEE_THROUGH`). Tout autre écran
 * doit garder le fond du thème : sinon la scène, ou l'écran précédent pendant une transition, se
 * verrait au travers.
 *
 * Limites : seuls les `_layout.tsx` de `src/app/` sont lus (un navigateur déclaré ailleurs échappe à
 * la garde), et un fond doit y être écrit tel quel (`theme.colors.bg` ou `SEE_THROUGH`, pas une
 * feuille de style).
 */

const APP = join(__dirname, '..', '..', '..', 'app');

function layoutsOf(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return layoutsOf(path);
    return entry.name === '_layout.tsx' ? [path] : [];
  });
}

/** Le code sans ses commentaires, les blancs réduits à une espace : insensible au formatage. */
function codeOf(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\/\/[^\n]*/g, ' ')
    .replace(/\s+/g, ' ');
}

/** Le fond opaque du thème, sur une ligne ou repliée par Prettier (virgule finale). */
const opaque = (prop: string) =>
  new RegExp(`${prop}: \\{ backgroundColor: theme\\.colors\\.bg,? \\}`);

/** Navigateurs du layout (`<Stack>`, `<Tabs>`) dont les options par défaut ne posent pas le fond. */
function navigatorsWithoutBackground(code: string): string[] {
  const missing: string[] = [];
  if (/<Stack\b(?![.\w])/.test(code) && !opaque('contentStyle').test(code)) missing.push('Stack');
  if (/<Tabs\b(?![.\w])/.test(code) && !opaque('sceneStyle').test(code)) missing.push('Tabs');
  return missing;
}

/**
 * Styles d'écran qui ne posent ni le fond du thème ni `SEE_THROUGH`. Un `contentStyle` ou un
 * `sceneStyle` propre à un écran remplace celui des options par défaut : sans fond, l'écran serait
 * transparent.
 */
function screensWithoutBackground(code: string): string[] {
  return [
    ...code.matchAll(
      /\b(?:contentStyle|sceneStyle): (?!SEE_THROUGH\b|\{ backgroundColor: theme\.colors\.bg\b)[^,}]*/g,
    ),
  ].map(([found]) => found.trim());
}

/**
 * Ce qui laisse voir à travers un layout : chaque `transparent` (couleur, `transparentModal`…),
 * chaque mention de `SEE_THROUGH`, et les écrans qui le prennent (`nom propriété`).
 */
function seeThroughOf(code: string) {
  return {
    transparent: code.match(/transparent/gi)?.length ?? 0,
    seeThrough: code.match(/SEE_THROUGH/g)?.length ?? 0,
    screens: [...code.matchAll(/name="([^"]+)" options=\{\{ (\w+): SEE_THROUGH,? \}\}/g)].map(
      ([, name, prop]) => `${name} ${prop}`,
    ),
  };
}

const layouts = layoutsOf(APP).map((path) => ({
  name: relative(APP, path),
  code: codeOf(readFileSync(path, 'utf8')),
}));

describe('fonds de la navigation (scène d’Explorer sous la pile)', () => {
  it('repère une pile ou des onglets sans fond, même repliés sur plusieurs lignes', () => {
    expect(
      navigatorsWithoutBackground(codeOf('<Stack screenOptions={{ headerShown: false }} />')),
    ).toEqual(['Stack']);
    expect(
      navigatorsWithoutBackground(codeOf('<Tabs screenOptions={{}}><Tabs.Screen /></Tabs>')),
    ).toEqual(['Tabs']);
    const wrapped = `<Stack
      screenOptions={{
        contentStyle: {
          backgroundColor: theme.colors.bg,
        },
      }}
    />`;
    expect(navigatorsWithoutBackground(codeOf(wrapped))).toEqual([]);
  });

  it('repère un écran dont le style propre oublie le fond', () => {
    const code = codeOf(`
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="marge" options={{ contentStyle: { paddingTop: 8 } }} />
        <Stack.Screen name="feuille" options={{ contentStyle: styles.bg }} />
        <Stack.Screen name="fond" options={{ contentStyle: { backgroundColor: theme.colors.bg, paddingTop: 8 } }} />
        <Stack.Screen name="voile" options={{ contentStyle: SEE_THROUGH }} />
      </Stack>`);
    expect(screensWithoutBackground(code)).toEqual([
      'contentStyle: { paddingTop: 8',
      'contentStyle: styles.bg',
    ]);
  });

  it('repère un écran transparent, quelle que soit son écriture', () => {
    const code = codeOf(`
      // Un commentaire « transparent » ne compte pas.
      <Stack.Screen name="feuille" options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="voile" options={{ contentStyle: SEE_THROUGH }} />`);
    expect(seeThroughOf(code)).toEqual({
      transparent: 1,
      seeThrough: 1,
      screens: ['voile contentStyle'],
    });
  });

  it('trouve les layouts de l’app', () => {
    expect(layouts.map((layout) => layout.name)).toEqual(
      expect.arrayContaining(['_layout.tsx', '(eleve)/_layout.tsx', '(parents)/_layout.tsx']),
    );
  });

  it.each(layouts.map((layout) => [layout.name, layout.code]))(
    '%s : chaque navigateur et chaque écran pose son fond',
    (_name, code) => {
      expect(navigatorsWithoutBackground(code)).toEqual([]);
      expect(screensWithoutBackground(code)).toEqual([]);
    },
  );

  it('ne laisse voir la scène qu’à travers l’espace élève et l’onglet Explorer', () => {
    const seeThrough = Object.fromEntries(
      layouts
        .map((layout) => [layout.name, seeThroughOf(layout.code)] as const)
        .filter(([, found]) => found.transparent > 0 || found.seeThrough > 0),
    );
    expect(seeThrough).toEqual({
      // SEE_THROUGH (importé de rootStage.ts) pour le seul écran (eleve).
      '_layout.tsx': { transparent: 0, seeThrough: 2, screens: ['(eleve) contentStyle'] },
      // SEE_THROUGH (importé) pour le seul onglet Explorer.
      '(eleve)/_layout.tsx': { transparent: 0, seeThrough: 2, screens: ['explorer sceneStyle'] },
    });
  });
});
