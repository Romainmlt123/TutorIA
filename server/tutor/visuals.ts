import type OpenAI from 'openai';
import { z } from 'zod';

import { parseExpression } from '@/features/tutor/logic/expression';
import {
  VISUAL_LIMITS as L,
  VISUAL_TONES,
  type TutorVisual,
  type VisualKind,
} from '@/services/tutor/visuals';

/*
 * Visuels du tuteur, côté serveur : les outils proposés au modèle, puis la validation stricte de ce
 * qu'il décrit. Un visuel mal formé est ignoré (le message du tuteur reste) ; un visuel valide est
 * modéré avec la réponse, enregistré avec le message et envoyé à l'app, qui le dessine.
 */

const tone = {
  type: 'string',
  enum: [...VISUAL_TONES],
  description: 'Couleur, que tu peux nommer dans ton message.',
} as const;
const text = (description: string) => ({ type: 'string', description }) as const;
const number = (description: string) => ({ type: 'number', description }) as const;
const flag = (description: string) => ({ type: 'boolean', description }) as const;
const list = (description: string, properties: Record<string, unknown>) =>
  ({
    type: 'array',
    description,
    items: {
      type: 'object',
      properties,
      required: Object.keys(properties),
      additionalProperties: false,
    },
  }) as const;
const tool = (
  name: string,
  description: string,
  properties: Record<string, unknown>,
): OpenAI.Responses.FunctionTool => ({
  type: 'function',
  name,
  description,
  strict: true,
  parameters: {
    type: 'object',
    properties: {
      title: text(`Titre court du visuel (${L.title} caractères au plus).`),
      description: text(
        `Ce que montre le visuel, en une phrase, pour un élève qui ne le voit pas (${L.description} caractères au plus).`,
      ),
      ...properties,
    },
    required: ['title', 'description', ...Object.keys(properties)],
    additionalProperties: false,
  },
});

/** Outils de l'API Responses, exécutés par le serveur : le modèle décrit, l'app dessine. */
export const VISUAL_TOOLS: OpenAI.Responses.FunctionTool[] = [
  tool('show_graph', 'Affiche un repère avec des droites ou des courbes y = f(x) et des points.', {
    x_min: number('Borne gauche de l’axe des x.'),
    x_max: number('Borne droite de l’axe des x.'),
    y_min: number('Borne basse de l’axe des y.'),
    y_max: number('Borne haute de l’axe des y.'),
    curves: list(`Droites ou courbes, ${L.curves} au plus.`, {
      expression: text(
        'Expression de f(x) en texte simple, par exemple « 3x + 5 » ou « x^2 - 1 ».',
      ),
      color: tone,
      dashed: flag('Trait pointillé.'),
      label: text('Étiquette courte, par exemple « y = 3x + 5 », ou vide.'),
    }),
    points: list(`Points à montrer, ${L.graphPoints} au plus.`, {
      x: number('Abscisse.'),
      y: number('Ordonnée.'),
      label: text('Étiquette courte, par exemple « (5 ; 20) », ou vide.'),
      color: tone,
      highlight: flag('Point clé : halo et pointillés de lecture vers les axes.'),
    }),
  }),
  tool(
    'write_board',
    'Écrit au tableau blanc un calcul ou une résolution pas à pas, une ligne par étape.',
    {
      steps: list(`Lignes du calcul, ${L.boardSteps} au plus.`, {
        tex: text('Formule de la ligne en LaTeX, sans $, par exemple « 3x + 5 = 20 ».'),
        operation: text(
          'Opération qui mène à la ligne suivante, en LaTeX sans $ (« -5 », « \\div 3 »), ou vide.',
        ),
        note: text('Courte note dans la marge, ou vide.'),
      }),
      result: text('Résultat à entourer, en LaTeX sans $, ou vide.'),
    },
  ),
  tool('show_chart', 'Affiche un diagramme statistique en barres ou circulaire.', {
    chart: { type: 'string', enum: ['bar', 'pie'], description: 'Barres ou secteurs.' },
    unit: text('Unité des valeurs (« élèves », « % »), ou vide.'),
    data: list(`Catégories, ${L.chartBars} au plus.`, {
      label: text('Nom de la catégorie.'),
      value: number('Effectif ou valeur, positif.'),
      color: tone,
    }),
  }),
  tool(
    'draw_figure',
    'Dessine une figure de géométrie à partir de points nommés et de leurs coordonnées.',
    {
      points: list(
        `Points nommés (une lettre majuscule, avec ' éventuel), ${L.figurePoints} au plus.`,
        {
          name: text('Nom du point, par exemple « A » ou « B’ ».'),
          x: number('Abscisse, dans un repère de ton choix.'),
          y: number('Ordonnée.'),
        },
      ),
      segments: list(`Segments entre deux points nommés, ${L.figureSegments} au plus.`, {
        from: text('Nom du premier point.'),
        to: text('Nom du second point.'),
        label: text('Longueur ou nom à afficher, par exemple « 5 cm », ou vide.'),
        color: tone,
        dashed: flag('Trait pointillé.'),
      }),
      angles: list(`Angles à coder, ${L.figureAngles} au plus.`, {
        vertex: text('Sommet de l’angle.'),
        from: text('Point sur le premier côté.'),
        to: text('Point sur le second côté.'),
        label: text('Mesure ou nom, par exemple « 60° », ou vide.'),
        right: flag('Angle droit (petit carré).'),
      }),
      circles: list(`Cercles, ${L.figureCircles} au plus.`, {
        center: text('Nom du point centre.'),
        radius: number('Rayon, dans les unités des coordonnées.'),
        color: tone,
      }),
    },
  ),
];

export const VISUAL_TOOL_NAMES = new Set(VISUAL_TOOLS.map((t) => t.name));

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const label = z.string().max(L.label);
const value = z.number().finite().min(-L.range).max(L.range);
const toneSchema = z.enum(VISUAL_TONES);
const head = {
  title: z.string().min(1).max(L.title),
  description: z.string().min(1).max(L.description),
};
const pointName = z.string().regex(/^[A-Z][’']?$/);

const graphSchema = z
  .object({
    ...head,
    x_min: value,
    x_max: value,
    y_min: value,
    y_max: value,
    curves: z
      .array(
        z.object({
          expression: z.string().refine((e) => parseExpression(e) !== null, 'expression illisible'),
          color: toneSchema,
          dashed: z.boolean(),
          label,
        }),
      )
      .max(L.curves),
    points: z
      .array(z.object({ x: value, y: value, label, color: toneSchema, highlight: z.boolean() }))
      .max(L.graphPoints),
  })
  .refine((g) => g.x_min < g.x_max && g.y_min < g.y_max, 'bornes inversées')
  .refine((g) => g.curves.length + g.points.length > 0, 'repère vide');

const boardSchema = z.object({
  ...head,
  steps: z
    .array(
      z.object({
        tex: z.string().min(1).max(L.tex),
        operation: z.string().max(L.label),
        note: label,
      }),
    )
    .min(1)
    .max(L.boardSteps),
  result: z.string().max(L.tex),
});

const chartSchema = z
  .object({
    ...head,
    chart: z.enum(['bar', 'pie']),
    unit: z.string().max(20),
    data: z
      .array(
        z.object({ label: z.string().min(1).max(L.label), value: value.min(0), color: toneSchema }),
      )
      .min(1)
      .max(L.chartBars),
  })
  .refine((c) => c.data.some((d) => d.value > 0), 'diagramme vide');

const figureSchema = z
  .object({
    ...head,
    points: z
      .array(z.object({ name: pointName, x: value, y: value }))
      .min(2)
      .max(L.figurePoints),
    segments: z
      .array(
        z.object({ from: pointName, to: pointName, label, color: toneSchema, dashed: z.boolean() }),
      )
      .max(L.figureSegments),
    angles: z
      .array(
        z.object({ vertex: pointName, from: pointName, to: pointName, label, right: z.boolean() }),
      )
      .max(L.figureAngles),
    circles: z
      .array(z.object({ center: pointName, radius: value.positive(), color: toneSchema }))
      .max(L.figureCircles),
  })
  .refine((f) => new Set(f.points.map((p) => p.name)).size === f.points.length, 'points en double')
  .refine((f) => {
    const names = new Set(f.points.map((p) => p.name));
    return (
      f.segments.every((s) => names.has(s.from) && names.has(s.to) && s.from !== s.to) &&
      f.angles.every((a) => names.has(a.vertex) && names.has(a.from) && names.has(a.to)) &&
      f.circles.every((c) => names.has(c.center))
    );
  }, 'point inconnu');

/**
 * Visuel décrit par un appel d'outil, validé et remis dans la forme de l'app ; null si l'outil
 * n'est pas un visuel ou si la description est invalide.
 */
export function parseVisualCall(name: string, rawArguments: string): TutorVisual | null {
  let args: unknown;
  try {
    args = JSON.parse(rawArguments);
  } catch {
    return null;
  }
  switch (name) {
    case 'show_graph': {
      const g = graphSchema.safeParse(args);
      if (!g.success) return null;
      return {
        kind: 'graph',
        title: g.data.title,
        description: g.data.description,
        xRange: [g.data.x_min, g.data.x_max],
        yRange: [g.data.y_min, g.data.y_max],
        curves: g.data.curves.map((c) => ({
          expression: c.expression,
          tone: c.color,
          dashed: c.dashed,
          label: c.label,
        })),
        points: g.data.points.map((p) => ({
          x: p.x,
          y: p.y,
          label: p.label,
          tone: p.color,
          highlight: p.highlight,
        })),
      };
    }
    case 'write_board': {
      const b = boardSchema.safeParse(args);
      return b.success ? { kind: 'board', ...b.data } : null;
    }
    case 'show_chart': {
      const c = chartSchema.safeParse(args);
      if (!c.success) return null;
      return {
        kind: 'chart',
        title: c.data.title,
        description: c.data.description,
        chart: c.data.chart,
        unit: c.data.unit,
        data: c.data.data.map((d) => ({ label: d.label, value: d.value, tone: d.color })),
      };
    }
    case 'draw_figure': {
      const f = figureSchema.safeParse(args);
      if (!f.success) return null;
      return {
        kind: 'figure',
        title: f.data.title,
        description: f.data.description,
        points: f.data.points,
        segments: f.data.segments.map((s) => ({
          from: s.from,
          to: s.to,
          label: s.label,
          tone: s.color,
          dashed: s.dashed,
        })),
        angles: f.data.angles,
        circles: f.data.circles.map((c) => ({ center: c.center, radius: c.radius, tone: c.color })),
      };
    }
    default:
      return null;
  }
}

/** Tous les textes d'un visuel, modérés avec la réponse du tuteur. */
export function visualText(visual: TutorVisual): string {
  const parts: string[] = [visual.title, visual.description];
  switch (visual.kind) {
    case 'graph':
      parts.push(...visual.curves.map((c) => c.label), ...visual.points.map((p) => p.label));
      break;
    case 'board':
      parts.push(...visual.steps.flatMap((s) => [s.tex, s.operation, s.note]), visual.result);
      break;
    case 'chart':
      parts.push(visual.unit, ...visual.data.map((d) => d.label));
      break;
    case 'figure':
      parts.push(...visual.segments.map((s) => s.label), ...visual.angles.map((a) => a.label));
      break;
  }
  return parts.filter(Boolean).join('\n');
}

const KIND_NAME: Record<VisualKind, string> = {
  graph: 'Graphique',
  board: 'Tableau blanc',
  chart: 'Diagramme',
  figure: 'Figure',
};

/** Rappel du visuel dans l'historique relu par le modèle : il se souvient de ce qu'il a montré. */
export function visualSummary(visual: TutorVisual): string {
  return `[${KIND_NAME[visual.kind]} affiché à l'élève : « ${visual.title} ». ${visual.description}]`;
}

/** Outil enregistré sur la séance (study_sessions.tools), affiché aux parents dans P3. */
export function sessionToolOf(visual: TutorVisual): 'graph' | 'whiteboard' {
  return visual.kind === 'board' ? 'whiteboard' : 'graph';
}
