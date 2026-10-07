import { renderTex } from './texToSvg';

describe('formules en SVG (MathJax)', () => {
  it('dessine une fraction, en un seul SVG, avec ses dimensions', () => {
    const fraction = renderTex('\\frac{3}{4}', false);
    expect(fraction?.xml.startsWith('<svg')).toBe(true);
    expect(fraction?.xml).not.toContain('style=');
    expect(fraction?.xml).not.toContain('data-');
    expect(fraction!.width).toBeGreaterThan(0);
    expect(fraction!.height).toBeGreaterThan(1);
    expect(fraction!.depth).toBeGreaterThan(0);
    const equation = renderTex('3x + 5 = 20', false);
    expect(equation?.xml.match(/<svg/g)).toHaveLength(1);
  });

  it('dessine ce qui sert au collège et au lycée, sans réseau', () => {
    for (const tex of [
      '\\sqrt{x^2+1} \\leq 2{,}5',
      '\\mathbb{R}',
      '\\mathcal{C}_f',
      '\\lim_{x \\to +\\infty} f(x)',
      '\\overrightarrow{AB} \\cdot \\vec{u}',
      '\\widehat{ABC} = 90^\\circ',
      '\\begin{cases} x + y = 1 \\\\ x - y = 3 \\end{cases}',
    ]) {
      expect(renderTex(tex, false)).not.toBeNull();
    }
  });

  it('rend null (le texte reste affiché) pour un LaTeX invalide ou un caractère non inclus', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(renderTex('\\frac{3}{', false)).toBeNull();
    expect(renderTex('\\mathfrak{A}', false)).toBeNull();
  });

  it('se charge avec le navigator de React Native, sans appVersion ni userAgent', () => {
    const real = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', {
      value: { product: 'ReactNative' },
      configurable: true,
      writable: true,
    });
    try {
      jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { renderTex: fresh } = require('./texToSvg') as typeof import('./texToSvg');
        expect(fresh('\\frac{1}{2}', false)).not.toBeNull();
      });
      // Le navigator de l'app est rendu tel quel après le chargement de MathJax.
      expect(globalThis.navigator).toEqual({ product: 'ReactNative' });
    } finally {
      if (real) Object.defineProperty(globalThis, 'navigator', real);
    }
  });
});
