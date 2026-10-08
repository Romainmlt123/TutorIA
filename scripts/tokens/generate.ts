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
  screenBand: {
    eleve: string[];
    violet: string[];
    angle: string;
    radiusBottom: string;
    overlap: string;
    titleSize: string;
    text: string;
    controlVeil: string;
    segmentActive: { background: string; textOnViolet: string; textOnEleve: string };
  };
  sectionTitle: { fontSize: string; lineHeight: string; fontWeight: number };
  goal: { gradient: string[]; text: string };
  profile: {
    summaryTile: {
      size: string;
      radius: string;
      icon: string;
      glow: { orange: string; violet: string; blue: string };
    };
    level: {
      gradient: string[];
      badgeGradient: string[];
      track: string;
      height: string;
      knob: string;
    };
    trophy: { size: string; locked: string; lockedRing: string; lockedInk: string };
    hero: { figure: string[]; halo: string; newsBadge: string };
  };
  auth: {
    background: { eleve: string[]; parents: string[] };
    angle: string;
    glows: { top: string; eleve: string; parents: string };
    sheet: { radius: string; shadow: string; padding: string; enter: string };
    avatar: { size: string; greetLevel: number; greetFrom: string; greetTo: string };
    field: { filledBackground: string; filledBorder: string };
  };
  voiceCall: {
    background: string[];
    angle: string;
    glass: string;
    dock: string;
    status: { speaking: string[]; listening: string[]; listeningOrange: string[]; neutral: string };
    avatar: {
      size: string;
      compactSize: string;
      hop: string;
      compactHop: string;
      cycle: string;
      squash: number;
      pauseFactor: number;
      tilt: string;
      breath: string;
    };
    captions: {
      spoken: string;
      upcoming: string;
      size: string;
      lineHeight: string;
      compactSize: string;
      compactLineHeight: string;
    };
    hangup: string;
  };
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

export function parseMs(value: string): number {
  const match = /^(\d+(?:\.\d+)?)ms$/.exec(value.trim());
  if (!match?.[1]) throw new Error(`Durée en ms attendue, reçu « ${value} »`);
  return Number(match[1]);
}

export function parseDeg(value: string): number {
  const match = /^(-?\d+(?:\.\d+)?)deg$/.exec(value.trim());
  if (!match?.[1]) throw new Error(`Angle en deg attendu, reçu « ${value} »`);
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
    screenBand: {
      student: parseGradient(app.screenBand.eleve, resolve),
      violet: parseGradient(app.screenBand.violet, resolve),
      angle: parseDeg(app.screenBand.angle),
      radiusBottom: parsePx(app.screenBand.radiusBottom),
      overlap: parsePx(app.screenBand.overlap),
      titleSize: parsePx(app.screenBand.titleSize),
      text: resolve(app.screenBand.text),
      controlVeil: app.screenBand.controlVeil,
      segmentActive: {
        background: resolve(app.screenBand.segmentActive.background),
        textOnViolet: resolve(app.screenBand.segmentActive.textOnViolet),
        textOnStudent: resolve(app.screenBand.segmentActive.textOnEleve),
      },
    },
    sectionTitle: {
      fontSize: parsePx(app.sectionTitle.fontSize),
      lineHeight: parsePx(app.sectionTitle.lineHeight),
    },
    goal: { gradient: parseGradient(app.goal.gradient, resolve), text: resolve(app.goal.text) },
    profile: {
      summaryTile: {
        size: parsePx(app.profile.summaryTile.size),
        radius: parsePx(app.profile.summaryTile.radius),
        icon: parsePx(app.profile.summaryTile.icon),
        glow: app.profile.summaryTile.glow,
      },
      level: {
        gradient: parseGradient(app.profile.level.gradient, resolve),
        badgeGradient: parseGradient(app.profile.level.badgeGradient, resolve),
        track: resolve(app.profile.level.track),
        height: parsePx(app.profile.level.height),
        knob: parsePx(app.profile.level.knob),
      },
      trophy: {
        size: parsePx(app.profile.trophy.size),
        locked: resolve(app.profile.trophy.locked),
        lockedRing: resolve(app.profile.trophy.lockedRing),
        lockedInk: resolve(app.profile.trophy.lockedInk),
      },
      hero: {
        figureWidth: parsePx(app.profile.hero.figure[0] ?? '0px'),
        figureHeight: parsePx(app.profile.hero.figure[1] ?? '0px'),
        halo: app.profile.hero.halo,
        newsBadge: resolve(app.profile.hero.newsBadge),
      },
    },
    auth: (() => {
      const [top = 0, side = 0, bottom = 0] = app.auth.sheet.padding.split(/\s+/).map(parsePx);
      return {
        background: {
          student: parseGradient(app.auth.background.eleve, resolve),
          parent: parseGradient(app.auth.background.parents, resolve),
        },
        angle: parseDeg(app.auth.angle),
        glows: {
          top: app.auth.glows.top,
          student: app.auth.glows.eleve,
          parent: app.auth.glows.parents,
        },
        sheet: {
          radius: parsePx(app.auth.sheet.radius),
          shadow: app.auth.sheet.shadow,
          paddingTop: top,
          paddingHorizontal: side,
          paddingBottom: bottom,
          enterMs: parseMs(app.auth.sheet.enter),
        },
        avatar: {
          size: parsePx(app.auth.avatar.size),
          greetLevel: app.auth.avatar.greetLevel,
          greetFromMs: parseMs(app.auth.avatar.greetFrom),
          greetToMs: parseMs(app.auth.avatar.greetTo),
        },
        field: {
          filledBackground: resolve(app.auth.field.filledBackground),
          filledBorder: resolve(app.auth.field.filledBorder),
        },
      };
    })(),
    voiceCall: {
      background: parseGradient(app.voiceCall.background, resolve),
      angle: parseDeg(app.voiceCall.angle),
      glass: app.voiceCall.glass,
      dock: app.voiceCall.dock,
      status: {
        speaking: parseGradient(app.voiceCall.status.speaking, resolve),
        listening: parseGradient(app.voiceCall.status.listening, resolve),
        listeningOrange: parseGradient(app.voiceCall.status.listeningOrange, resolve),
        neutral: app.voiceCall.status.neutral,
      },
      avatar: {
        size: parsePx(app.voiceCall.avatar.size),
        compactSize: parsePx(app.voiceCall.avatar.compactSize),
        hop: parsePx(app.voiceCall.avatar.hop),
        compactHop: parsePx(app.voiceCall.avatar.compactHop),
        cycleMs: parseMs(app.voiceCall.avatar.cycle),
        squash: app.voiceCall.avatar.squash,
        pauseFactor: app.voiceCall.avatar.pauseFactor,
        tilt: parseDeg(app.voiceCall.avatar.tilt),
        breathMs: parseMs(app.voiceCall.avatar.breath),
      },
      captions: {
        spoken: resolve(app.voiceCall.captions.spoken),
        upcoming: app.voiceCall.captions.upcoming,
        size: parsePx(app.voiceCall.captions.size),
        lineHeight: parsePx(app.voiceCall.captions.lineHeight),
        compactSize: parsePx(app.voiceCall.captions.compactSize),
        compactLineHeight: parsePx(app.voiceCall.captions.compactLineHeight),
      },
      hangup: resolve(app.voiceCall.hangup),
    },
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
