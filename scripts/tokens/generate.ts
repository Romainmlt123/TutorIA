/**
 * Transforme les tokens du design system (design/tokens/tokens.json) et ceux de l'app élève
 * (design/tokens/app-tokens.json) en un module TypeScript typé : src/theme/tokens.generated.ts.
 * Fonctions pures, sans accès disque, pour pouvoir être testées.
 */

type ColorToken = { name: string; value: string };
type TypeStyle = {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  sample?: string;
};

export type DesignTokens = {
  color: { tokens: ColorToken[] };
  type: { groups: { styles: TypeStyle[] }[] };
  spacing: { tokens: { name: string; value: string }[] };
  radius: { tokens: { name: string; value: string }[] };
  shadow: { tokens: { name: string; value: string }[] };
};

type GradientSource = string[] | string;

export type AppTokens = {
  radius: Record<string, string>;
  subjects: {
    id: string;
    name: string;
    gradient: string[];
    soft: string;
    ink: string;
    bar: string;
    icon: string;
  }[];
  gradientAngle: string;
  game: {
    streak: { background: string; text: string };
    level: { background: string; text: string; xp: string };
  };
  kpi: Record<string, GradientSource>;
  voice: { bars: string[]; barWidth: string; barGap: string; idleSize: string };
  onColor: { veil: string; track: string };
  navigation: {
    height: string;
    inset: string;
    radius: string;
    shadow: string;
    activeBubble: string;
  };
  hero: { gradient: string[]; text: string };
  statuses: Record<
    string,
    { label: string; background: string; text: string } | Record<string, string>
  >;
  settingTiles: Record<string, string>;
};

export type Gradient = { colors: string[]; locations: number[] };

const PALETTE_NAME = /^([a-z]+)-(\d{3})$/;
const ALIAS = /^\{(.+)\}$/;

export function kebabToCamel(name: string): string {
  return name.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

export function parsePx(value: string): number {
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim());
  if (!match?.[1]) throw new Error(`Valeur en px attendue, reçu « ${value} »`);
  return Number(match[1]);
}

/** Crée un résolveur d'alias `{nom-du-token}` vers la valeur finale (récursif). */
export function createColorResolver(tokens: ColorToken[]): (value: string) => string {
  const byName = new Map(tokens.map((t) => [t.name, t.value]));
  const resolve = (value: string, seen: Set<string>): string => {
    const alias = ALIAS.exec(value)?.[1];
    if (!alias) return value.toLowerCase();
    if (seen.has(alias)) throw new Error(`Alias circulaire : ${alias}`);
    const target = byName.get(alias);
    if (target === undefined) throw new Error(`Alias inconnu : ${alias}`);
    return resolve(target, new Set([...seen, alias]));
  };
  return (value) => resolve(value, new Set());
}

/** « #c21a1a 60% » → { color, location: 0.6 } ; sans pourcentage, la position est calculée. */
export function parseGradient(stops: string[], resolve: (v: string) => string): Gradient {
  const parsed = stops.map((stop) => {
    const [color = '', percent] = stop.trim().split(/\s+/);
    return {
      color: resolve(color),
      location: percent === undefined ? undefined : Number(percent.replace('%', '')) / 100,
    };
  });
  const last = parsed.length - 1;
  return {
    colors: parsed.map((p) => p.color),
    locations: parsed.map((p, i) => p.location ?? (last === 0 ? 0 : i / last)),
  };
}

function getByPath(root: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || typeof node !== 'object') return undefined;
    if (Array.isArray(node)) return node.find((item: { id?: string }) => item.id === key);
    return (node as Record<string, unknown>)[key];
  }, root);
}

function buildPalette(tokens: ColorToken[], resolve: (v: string) => string) {
  const palette: Record<string, Record<string, string>> = {};
  const roles: Record<string, string> = {};
  for (const token of tokens) {
    const match = PALETTE_NAME.exec(token.name);
    if (match?.[1] && match[2]) {
      palette[match[1]] ??= {};
      palette[match[1]]![match[2]] = resolve(token.value);
    } else {
      roles[kebabToCamel(token.name)] = resolve(token.value);
    }
  }
  return { palette, roles };
}

function buildTypeScale(design: DesignTokens) {
  const scale: Record<string, object> = {};
  for (const style of design.type.groups.flatMap((g) => g.styles)) {
    const fontSize = parsePx(style.fontSize);
    const em = style.letterSpacing ? Number(style.letterSpacing.replace('em', '')) : 0;
    scale[kebabToCamel(style.name)] = {
      fontSize,
      lineHeight: parsePx(style.lineHeight),
      fontWeight: style.fontWeight,
      letterSpacing: Math.round(em * fontSize * 100) / 100,
      sample: style.sample ?? '',
    };
  }
  return scale;
}

function scaleByName(
  list: { name: string; value: string }[],
  prefix: string,
  parse: (v: string) => unknown,
) {
  return Object.fromEntries(list.map((t) => [t.name.replace(prefix, ''), parse(t.value)]));
}

export function buildTokens(design: DesignTokens, app: AppTokens) {
  const resolve = createColorResolver(design.color.tokens);
  const { palette, roles } = buildPalette(design.color.tokens, resolve);
  const radius = {
    ...scaleByName(design.radius.tokens, 'radius-', parsePx),
    ...scaleByName(
      Object.entries(app.radius).map(([name, value]) => ({ name, value })),
      'radius-',
      parsePx,
    ),
  } as Record<string, number>;
  const shadow = scaleByName(design.shadow.tokens, 'shadow-', (v) => v) as Record<string, string>;

  const subjects = Object.fromEntries(
    app.subjects.map((s) => [
      s.id,
      {
        id: s.id,
        name: s.name,
        gradient: parseGradient(s.gradient, resolve),
        soft: resolve(s.soft),
        ink: resolve(s.ink),
        bar: resolve(s.bar),
        icon: s.icon,
      },
    ]),
  );

  const resolveGradientSource = (source: GradientSource): unknown => {
    if (Array.isArray(source)) return parseGradient(source, resolve);
    const target = getByPath(app, source);
    if (Array.isArray(target)) return parseGradient(target as string[], resolve);
    if (target && typeof target === 'object') {
      // On ne garde que les couleurs : les clés « note » sont de la documentation.
      return Object.fromEntries(
        Object.entries(target)
          .filter(([key]) => key !== 'note')
          .map(([key, value]) => [key, typeof value === 'string' ? resolve(value) : value]),
      );
    }
    throw new Error(`Référence de token introuvable : ${source}`);
  };

  // Tuiles des réglages : une couleur (alias) ou la teinte d'une matière (« violet » = Physique-Chimie).
  const subjectByHue: Record<string, string> = {
    red: 'maths',
    blue: 'francais',
    green: 'histoire-geo',
    cyan: 'anglais',
    brown: 'svt',
    violet: 'physique-chimie',
  };
  const settingTiles = Object.fromEntries(
    Object.entries(app.settingTiles).map(([key, value]) => {
      if (ALIAS.test(value)) {
        const color = resolve(value);
        return [key, { colors: [color, color], locations: [0, 1] }];
      }
      const subject = subjectByHue[value];
      const source = app.subjects.find((s) => s.id === subject);
      if (!source) throw new Error(`Teinte de réglage inconnue : ${value}`);
      return [key, parseGradient(source.gradient, resolve)];
    }),
  );

  const statuses: Record<string, unknown> = Object.fromEntries(
    Object.entries(app.statuses).map(([key, value]) => {
      // sessionOutcome : correspondance résultat de séance → statut, gardée telle quelle.
      if (!('label' in value)) return [key, value];
      const style = value as { label: string; background: string; text: string };
      return [
        key,
        { label: style.label, background: resolve(style.background), text: resolve(style.text) },
      ];
    }),
  );

  const [bubble, tutorBubble] = [...app.navigation.activeBubble.matchAll(/(\d+)px/g)].map((m) =>
    Number(m[1]),
  );
  const resolveRef = (value: string) => ALIAS.exec(value)?.[1] ?? value;

  return {
    palette,
    colors: roles,
    space: scaleByName(design.spacing.tokens, 'space-', parsePx),
    radius,
    shadow,
    typeScale: buildTypeScale(design),
    subjects,
    gradientAngle: Number(app.gradientAngle.replace('deg', '')),
    game: {
      streak: {
        background: resolve(app.game.streak.background),
        text: resolve(app.game.streak.text),
      },
      level: {
        background: resolve(app.game.level.background),
        text: resolve(app.game.level.text),
        xp: resolve(app.game.level.xp),
      },
    },
    kpi: Object.fromEntries(
      Object.entries(app.kpi).map(([key, source]) => [key, resolveGradientSource(source)]),
    ),
    voice: {
      bars: parseGradient(app.voice.bars, resolve),
      barWidth: parsePx(app.voice.barWidth),
      barGap: parsePx(app.voice.barGap),
      idleSize: parsePx(app.voice.idleSize),
    },
    onColor: { veil: app.onColor.veil, track: app.onColor.track },
    navigation: {
      height: parsePx(app.navigation.height),
      inset: parsePx(app.navigation.inset),
      radius: radius[resolveRef(app.navigation.radius).replace('radius-', '')],
      shadow: shadow[resolveRef(app.navigation.shadow).replace('shadow-', '')],
      activeBubble: bubble,
      activeBubbleTutor: tutorBubble,
    },
    hero: { gradient: parseGradient(app.hero.gradient, resolve), text: resolve(app.hero.text) },
    statuses,
    settingTiles,
  };
}

const HEADER = `/*
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 * Source : design/tokens/tokens.json et design/tokens/app-tokens.json.
 * Régénérer avec : npm run tokens
 */
`;

export function generateTokensModule(design: DesignTokens, app: AppTokens): string {
  const tokens = buildTokens(design, app);
  const exports = Object.entries(tokens).map(
    ([name, value]) => `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`,
  );
  return `${HEADER}\n${exports.join('\n')}`;
}
