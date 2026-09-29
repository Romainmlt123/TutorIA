import { parseEmphasis } from './emphasis';

describe('parseEmphasis', () => {
  it('met en italique les notions entre astérisques', () => {
    expect(parseEmphasis('Dans 3x, le 3 *multiplie* x.')).toEqual([
      { text: 'Dans 3x, le 3 ', italic: false },
      { text: 'multiplie', italic: true },
      { text: ' x.', italic: false },
    ]);
  });

  it('laisse un texte sans astérisque intact', () => {
    expect(parseEmphasis('x = 5')).toEqual([{ text: 'x = 5', italic: false }]);
  });
});
