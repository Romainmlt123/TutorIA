import { textStyle } from './typography';

describe('textStyle', () => {
  it('porte la graisse par la famille Satoshi, sans fontWeight', () => {
    const style = textStyle('h2', { weight: 'black' });
    expect(style).toEqual({
      fontFamily: 'Satoshi-Black',
      fontSize: 28,
      lineHeight: 36,
      letterSpacing: 0,
    });
    expect(style).not.toHaveProperty('fontWeight');
  });

  it('utilise la graisse des tokens par défaut et gère l’italique', () => {
    expect(textStyle('body').fontFamily).toBe('Satoshi-Regular');
    expect(textStyle('h3').fontFamily).toBe('Satoshi-Medium');
    expect(textStyle('body', { italic: true }).fontFamily).toBe('Satoshi-Italic');
    expect(textStyle('label', { weight: 'bold', italic: true }).fontFamily).toBe(
      'Satoshi-BoldItalic',
    );
  });

  it('met le surtitre en capitales espacées', () => {
    expect(textStyle('overline')).toMatchObject({
      fontFamily: 'Satoshi-Bold',
      textTransform: 'uppercase',
      letterSpacing: 0.96,
    });
  });
});
