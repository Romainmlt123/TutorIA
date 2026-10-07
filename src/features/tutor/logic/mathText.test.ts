import { parseMathMessage, splitTexText, spokenTex } from './mathText';

describe('formules du tuteur', () => {
  it('sépare le texte, les formules dans la phrase et l’italique', () => {
    expect(parseMathMessage('On *isole* $x$ : $3x = 15$ donc')).toEqual([
      {
        kind: 'inline',
        pieces: [
          { kind: 'text', text: 'On ', italic: false },
          { kind: 'text', text: 'isole', italic: true },
          { kind: 'text', text: ' ', italic: false },
          { kind: 'math', tex: 'x' },
          { kind: 'text', text: ' : ', italic: false },
          { kind: 'math', tex: '3x = 15' },
          { kind: 'text', text: ' donc', italic: false },
        ],
      },
    ]);
  });

  it('met une formule $$…$$ seule sur sa ligne', () => {
    expect(parseMathMessage('Regarde :\n$$\\frac{3}{4} = 0{,}75$$\nTu vois ?')).toEqual([
      { kind: 'inline', pieces: [{ kind: 'text', text: 'Regarde :', italic: false }] },
      { kind: 'display', tex: '\\frac{3}{4} = 0{,}75' },
      { kind: 'inline', pieces: [{ kind: 'text', text: 'Tu vois ?', italic: false }] },
    ]);
  });

  it('accepte aussi \\( … \\) et \\[ … \\]', () => {
    expect(parseMathMessage('Soit \\(x^2\\).\n\\[x = 5\\]')).toEqual([
      {
        kind: 'inline',
        pieces: [
          { kind: 'text', text: 'Soit ', italic: false },
          { kind: 'math', tex: 'x^2' },
          { kind: 'text', text: '.', italic: false },
        ],
      },
      { kind: 'display', tex: 'x = 5' },
    ]);
  });

  it('laisse en texte une formule pas encore fermée (réponse en cours d’arrivée)', () => {
    expect(parseMathMessage('On a $3x + 5')).toEqual([
      { kind: 'inline', pieces: [{ kind: 'text', text: 'On a $3x + 5', italic: false }] },
    ]);
  });

  it('lit une formule à voix haute sans ses commandes', () => {
    expect(spokenTex('\\frac{3}{4} \\times x^2 \\leq 2{,}5')).toBe(
      '3 sur 4 fois x au carré inférieur ou égal à 2,5',
    );
  });

  it('sépare les mots d’une formule, que l’app écrit elle-même', () => {
    expect(splitTexText('-5 \\text{ des deux côtés}')).toEqual([
      { kind: 'tex', tex: '-5' },
      { kind: 'text', text: ' des deux côtés' },
    ]);
    expect(splitTexText('\\text{prix} = 2 \\times \\text{quantité}')).toEqual([
      { kind: 'text', text: 'prix' },
      { kind: 'tex', tex: '= 2 \\times' },
      { kind: 'text', text: 'quantité' },
    ]);
    expect(splitTexText('\\frac{3}{4}')).toEqual([{ kind: 'tex', tex: '\\frac{3}{4}' }]);
  });
});
