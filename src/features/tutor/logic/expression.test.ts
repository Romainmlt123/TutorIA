import { parseExpression } from './expression';

const at = (source: string, x: number) => parseExpression(source)?.(x);

describe('expressions des courbes', () => {
  it('lit les fonctions affines du collège, avec la multiplication sous-entendue', () => {
    expect(at('3x + 5', 5)).toBe(20);
    expect(at('y = -2x + 1', 3)).toBe(-5);
    expect(at('f(x) = 0,5x', 4)).toBe(2);
    expect(at('2(x - 1)', 4)).toBe(6);
  });

  it('respecte les priorités : puissance, signe, produit, somme', () => {
    expect(at('x^2 - 1', 3)).toBe(8);
    expect(at('-x^2', 3)).toBe(-9);
    expect(at('2^x^2', 2)).toBe(16);
    expect(at('1 + 2 * 3', 0)).toBe(7);
    expect(at('8 / 2 / 2', 0)).toBe(2);
    expect(at('x²', 4)).toBe(16);
  });

  it('connaît π, la racine carrée et la valeur absolue', () => {
    expect(at('pi x^2', 1)).toBeCloseTo(Math.PI);
    expect(at('sqrt(x)', 9)).toBe(3);
    expect(at('abs(x - 3)', 1)).toBe(2);
    expect(at('3 × x − 1', 2)).toBe(5);
  });

  it('refuse tout ce qui n’est pas une expression : jamais de code exécuté', () => {
    for (const source of [
      '',
      'x +',
      '(x + 1',
      'alert(1)',
      'x; process.exit()',
      'Math.max(x)',
      '2 ** 3',
      'y',
      'x'.repeat(61),
    ]) {
      expect(parseExpression(source)).toBeNull();
    }
  });
});
