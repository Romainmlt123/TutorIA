/*
 * Visuels du tuteur (chantier 3, maquettes 2C à 2F) : le tuteur ne dessine jamais, il décrit un
 * visuel par un appel d'outil ; le serveur valide et modère cette description, puis l'app la
 * dessine avec ses propres composants, dans la charte. Contrat partagé entre l'app et le serveur.
 */

/** Couleurs que le tuteur peut nommer (« la droite rouge ») : des rôles du thème, jamais de code couleur. */
export const VISUAL_TONES = ['rouge', 'bleu', 'vert', 'orange', 'violet', 'gris'] as const;
export type VisualTone = (typeof VISUAL_TONES)[number];

/** Limites communes : le serveur les impose, l'app peut compter dessus. */
export const VISUAL_LIMITS = {
  title: 60,
  description: 300,
  label: 40,
  /** Formule LaTeX d'une ligne du tableau. */
  tex: 120,
  /** Expression d'une courbe (`3x + 5`, `x^2 - 1`). */
  expression: 60,
  /** Bornes d'un repère, en valeur absolue. */
  range: 1000,
  curves: 4,
  graphPoints: 6,
  boardSteps: 8,
  chartBars: 12,
  figurePoints: 10,
  figureSegments: 16,
  figureAngles: 6,
  figureCircles: 3,
} as const;

/** Repère : droites et courbes y = f(x), points mis en avant (2C). */
export type GraphVisual = {
  kind: 'graph';
  title: string;
  description: string;
  xRange: readonly [number, number];
  yRange: readonly [number, number];
  curves: readonly { expression: string; tone: VisualTone; dashed: boolean; label: string }[];
  points: readonly {
    x: number;
    y: number;
    label: string;
    tone: VisualTone;
    /** Point clé : halo et pointillés de lecture vers les axes. */
    highlight: boolean;
  }[];
};

/** Tableau blanc : un calcul ligne à ligne, opérations en marge, résultat entouré (2E). */
export type BoardVisual = {
  kind: 'board';
  title: string;
  description: string;
  steps: readonly {
    /** Formule de la ligne, en LaTeX. */
    tex: string;
    /** Opération qui mène à la ligne suivante, en LaTeX (`-5`, `\div 3`), ou vide. */
    operation: string;
    /** Courte note dans la marge, ou vide. */
    note: string;
  }[];
  /** Résultat entouré, en LaTeX, ou vide. */
  result: string;
};

/** Statistiques : diagramme en barres ou circulaire. */
export type ChartVisual = {
  kind: 'chart';
  title: string;
  description: string;
  chart: 'bar' | 'pie';
  data: readonly { label: string; value: number; tone: VisualTone }[];
  /** Unité affichée avec les valeurs (`élèves`, `%`), ou vide. */
  unit: string;
};

/** Figure de géométrie : points nommés, segments, angles codés, cercles. */
export type FigureVisual = {
  kind: 'figure';
  title: string;
  description: string;
  points: readonly { name: string; x: number; y: number }[];
  segments: readonly {
    from: string;
    to: string;
    label: string;
    tone: VisualTone;
    dashed: boolean;
  }[];
  angles: readonly { vertex: string; from: string; to: string; label: string; right: boolean }[];
  circles: readonly { center: string; radius: number; tone: VisualTone }[];
};

export type TutorVisual = GraphVisual | BoardVisual | ChartVisual | FigureVisual;
export type VisualKind = TutorVisual['kind'];
