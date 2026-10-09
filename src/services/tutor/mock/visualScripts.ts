import type { TutorVisual } from '../visuals';

/*
 * Visuels du tuteur simulé : un exemple de chaque sorte, tiré des maquettes (2C, 2E) et du
 * programme de 4e, pour le mode hors ligne, les tests et le catalogue de développement.
 */

export const MOCK_VISUALS = {
  graph: {
    kind: 'graph',
    title: '3x + 5 = 20',
    description:
      'La droite rouge y = 3x + 5 coupe la droite bleue y = 20 au point d’abscisse 5 : la solution est x = 5.',
    xRange: [-1, 7],
    yRange: [0, 30],
    curves: [
      { expression: '3x + 5', tone: 'rouge', dashed: false, label: 'y = 3x + 5' },
      { expression: '20', tone: 'bleu', dashed: true, label: 'y = 20' },
    ],
    points: [{ x: 5, y: 20, label: '(5 ; 20)', tone: 'rouge', highlight: true }],
  },
  board: {
    kind: 'board',
    title: '3x + 5 = 20',
    description:
      'Résolution : on retire 5 des deux côtés, puis on divise par 3. La solution est x = 5.',
    steps: [
      {
        tex: '3x + 5 = 20',
        operation: '-5 \\text{ des deux côtés}',
        note: 'On part de l’équation',
      },
      { tex: '3x = 15', operation: '\\div 3 \\text{ des deux côtés}', note: 'On isole 3x' },
      { tex: 'x = 5', operation: '', note: 'On isole x' },
    ],
    result: 'x = 5',
  },
  chart: {
    kind: 'chart',
    title: 'Sport préféré de la classe',
    description:
      'Diagramme en barres : 12 élèves pour le foot, 8 pour la danse, 6 pour le basket et 4 pour la natation.',
    chart: 'bar',
    unit: 'élèves',
    data: [
      { label: 'Foot', value: 12, tone: 'bleu' },
      { label: 'Danse', value: 8, tone: 'violet' },
      { label: 'Basket', value: 6, tone: 'orange' },
      { label: 'Natation', value: 4, tone: 'vert' },
    ],
  },
  figure: {
    kind: 'figure',
    title: 'Triangle ABC rectangle en A',
    description:
      'Triangle ABC rectangle en A, avec AB = 4 cm et AC = 3 cm ; l’hypoténuse BC est en rouge.',
    points: [
      { name: 'A', x: 0, y: 0 },
      { name: 'B', x: 4, y: 0 },
      { name: 'C', x: 0, y: 3 },
    ],
    segments: [
      { from: 'A', to: 'B', label: '4 cm', tone: 'bleu', dashed: false },
      { from: 'A', to: 'C', label: '3 cm', tone: 'bleu', dashed: false },
      { from: 'B', to: 'C', label: '?', tone: 'rouge', dashed: false },
    ],
    angles: [{ vertex: 'A', from: 'B', to: 'C', label: '', right: true }],
    circles: [],
  },
} satisfies Record<TutorVisual['kind'], TutorVisual>;

const TRIGGERS: { pattern: RegExp; visual: TutorVisual; reply: string }[] = [
  {
    pattern: /tableau/i,
    visual: MOCK_VISUALS.board,
    reply:
      'Je te l’écris au tableau : à chaque ligne, on fait la même opération des deux côtés. Tu vois l’opération en bleu ?',
  },
  {
    pattern: /diagramme|statistique|effectif/i,
    visual: MOCK_VISUALS.chart,
    reply:
      'Regarde le diagramme : la barre bleue du foot est la plus haute. Quel est l’effectif total de la classe ?',
  },
  {
    pattern: /figure|triangle|pythagore/i,
    visual: MOCK_VISUALS.figure,
    reply:
      'Voici le triangle : le petit carré code l’angle droit en A. Que dit Pythagore sur le côté rouge ?',
  },
  {
    pattern: /graphique|courbe|droite|fonction/i,
    visual: MOCK_VISUALS.graph,
    reply:
      'Regarde le graphique : la droite rouge croise la droite bleue en un point. Quelle est son abscisse ?',
  },
];

/** Visuel et réponse du tuteur simulé si l'élève en demande un, sinon null. */
export function mockVisualTurn(message: string): { visual: TutorVisual; reply: string } | null {
  const trigger = TRIGGERS.find((t) => t.pattern.test(message));
  return trigger ? { visual: trigger.visual, reply: trigger.reply } : null;
}
