/**
 * @jest-environment node
 */
import { parseVisualCall, sessionToolOf, visualSummary, visualText, VISUAL_TOOLS } from './visuals';

const call = (name: string, args: object) => parseVisualCall(name, JSON.stringify(args));
const head = {
  title: '3x + 5 = 20',
  description: 'La droite rouge coupe la droite bleue en x = 5.',
};

const graph = {
  ...head,
  x_min: -1,
  x_max: 7,
  y_min: 0,
  y_max: 30,
  curves: [
    { expression: '3x + 5', color: 'rouge', dashed: false, label: 'y = 3x + 5' },
    { expression: '20', color: 'bleu', dashed: true, label: 'y = 20' },
  ],
  points: [{ x: 5, y: 20, label: '(5 ; 20)', color: 'rouge', highlight: true }],
};

const figure = {
  ...head,
  points: [
    { name: 'A', x: 0, y: 0 },
    { name: 'B', x: 4, y: 0 },
    { name: 'C', x: 0, y: 3 },
  ],
  segments: [
    { from: 'A', to: 'B', label: '4 cm', color: 'bleu', dashed: false },
    { from: 'B', to: 'C', label: '?', color: 'rouge', dashed: false },
    { from: 'C', to: 'A', label: '3 cm', color: 'bleu', dashed: false },
  ],
  angles: [{ vertex: 'A', from: 'B', to: 'C', label: '', right: true }],
  circles: [],
};

describe('visuels du tuteur (serveur)', () => {
  it('remet un graphique valide dans la forme de l’app', () => {
    expect(call('show_graph', graph)).toEqual({
      kind: 'graph',
      ...head,
      xRange: [-1, 7],
      yRange: [0, 30],
      curves: [
        { expression: '3x + 5', tone: 'rouge', dashed: false, label: 'y = 3x + 5' },
        { expression: '20', tone: 'bleu', dashed: true, label: 'y = 20' },
      ],
      points: [{ x: 5, y: 20, label: '(5 ; 20)', tone: 'rouge', highlight: true }],
    });
  });

  it('accepte un tableau blanc, un diagramme et une figure', () => {
    expect(
      call('write_board', {
        ...head,
        steps: [
          { tex: '3x + 5 = 20', operation: '-5', note: 'On retire 5' },
          { tex: '3x = 15', operation: '\\div 3', note: '' },
          { tex: 'x = 5', operation: '', note: '' },
        ],
        result: 'x = 5',
      }),
    ).toMatchObject({ kind: 'board', result: 'x = 5' });
    expect(
      call('show_chart', {
        ...head,
        chart: 'bar',
        unit: 'élèves',
        data: [
          { label: 'Foot', value: 12, color: 'bleu' },
          { label: 'Danse', value: 8, color: 'violet' },
        ],
      }),
    ).toMatchObject({ kind: 'chart', data: [{ tone: 'bleu' }, { tone: 'violet' }] });
    expect(call('draw_figure', figure)).toMatchObject({ kind: 'figure' });
  });

  it('ignore un visuel mal formé, sans jamais casser la réponse', () => {
    expect(parseVisualCall('show_graph', '{pas du json')).toBeNull();
    expect(call('show_graph', { ...graph, x_min: 8 })).toBeNull();
    expect(
      call('show_graph', {
        ...graph,
        curves: [{ ...graph.curves[0], expression: 'process.exit()' }],
      }),
    ).toBeNull();
    expect(call('show_graph', { ...graph, curves: [], points: [] })).toBeNull();
    expect(
      call('show_graph', { ...graph, points: [{ ...graph.points[0], color: '#ff0000' }] }),
    ).toBeNull();
    expect(
      call('draw_figure', { ...figure, segments: [{ ...figure.segments[0], to: 'Z' }] }),
    ).toBeNull();
    expect(
      call('draw_figure', { ...figure, points: [...figure.points, { name: 'A', x: 1, y: 1 }] }),
    ).toBeNull();
    expect(call('show_chart', { ...head, chart: 'pie', unit: '', data: [] })).toBeNull();
    expect(
      call('write_board', {
        ...head,
        steps: Array(9).fill({ tex: 'x', operation: '', note: '' }),
        result: '',
      }),
    ).toBeNull();
    expect(call('record_answer', graph)).toBeNull();
  });

  it('donne tous ses textes à la modération, et un rappel au modèle', () => {
    const visual = call('show_graph', graph)!;
    expect(visualText(visual)).toContain('y = 3x + 5');
    expect(visualText(visual)).toContain('(5 ; 20)');
    expect(visualSummary(visual)).toBe(
      "[Graphique affiché à l'élève : « 3x + 5 = 20 ». La droite rouge coupe la droite bleue en x = 5.]",
    );
    expect(sessionToolOf(visual)).toBe('graph');
  });

  it('respecte le mode strict d’OpenAI : chaque objet exige toutes ses clés, et aucune autre', () => {
    const check = (schema: Record<string, unknown>) => {
      if (schema.type === 'object') {
        const properties = schema.properties as Record<string, Record<string, unknown>>;
        expect(schema.additionalProperties).toBe(false);
        expect([...(schema.required as string[])].sort()).toEqual(Object.keys(properties).sort());
        Object.values(properties).forEach(check);
      }
      if (schema.type === 'array') check(schema.items as Record<string, unknown>);
    };
    for (const tool of VISUAL_TOOLS) {
      expect(tool.strict).toBe(true);
      check(tool.parameters as Record<string, unknown>);
    }
  });
});
