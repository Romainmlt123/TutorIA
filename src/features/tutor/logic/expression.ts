/*
 * Expressions des courbes du tuteur (`3x + 5`, `x^2 - 1`, `2(x - 1)`, `sqrt(x)`), lues sans jamais
 * exécuter de code : un petit analyseur récursif ne connaît que x, les nombres, π, les quatre
 * opérations, la puissance, les parenthèses, `sqrt` et `abs`. Partagé par le serveur (validation)
 * et l'app (tracé).
 */

export type Expression = (x: number) => number;

type Token =
  | { kind: 'number'; value: number }
  | { kind: 'x' }
  | { kind: 'pi' }
  | { kind: 'fn'; name: 'sqrt' | 'abs' }
  | { kind: 'op'; value: '+' | '-' | '*' | '/' | '^' }
  | { kind: 'open' }
  | { kind: 'close' };

const MAX_LENGTH = 60;
const MAX_DEPTH = 20;

/** Écritures du clavier et de l'écrit ramenées à une seule : − × · ÷ ² ³, virgule décimale. */
function normalize(source: string): string {
  return source
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/π/g, 'pi')
    .replace(/√/g, 'sqrt')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, '');
}

function tokenize(source: string): Token[] | null {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const rest = source.slice(i);
    const number = rest.match(/^\d+(\.\d+)?/);
    if (number) {
      tokens.push({ kind: 'number', value: Number(number[0]) });
      i += number[0].length;
    } else if (rest.startsWith('sqrt') || rest.startsWith('abs')) {
      const name = rest.startsWith('sqrt') ? 'sqrt' : 'abs';
      tokens.push({ kind: 'fn', name });
      i += name.length;
    } else if (rest.startsWith('pi')) {
      tokens.push({ kind: 'pi' });
      i += 2;
    } else if (rest[0] === 'x') {
      tokens.push({ kind: 'x' });
      i += 1;
    } else if ('+-*/^'.includes(rest[0]!)) {
      tokens.push({ kind: 'op', value: rest[0] as '+' | '-' | '*' | '/' | '^' });
      i += 1;
    } else if (rest[0] === '(') {
      tokens.push({ kind: 'open' });
      i += 1;
    } else if (rest[0] === ')') {
      tokens.push({ kind: 'close' });
      i += 1;
    } else {
      return null;
    }
  }
  return tokens;
}

class Parser {
  private index = 0;
  private depth = 0;

  constructor(private readonly tokens: Token[]) {}

  parse(): Expression | null {
    const expression = this.sum();
    return expression && this.index === this.tokens.length ? expression : null;
  }

  private peek(): Token | undefined {
    return this.tokens[this.index];
  }

  private isOp(value: string): boolean {
    const token = this.peek();
    return token?.kind === 'op' && token.value === value;
  }

  private sum(): Expression | null {
    let left = this.product();
    while (left && (this.isOp('+') || this.isOp('-'))) {
      const minus = this.isOp('-');
      this.index++;
      const right = this.product();
      if (!right) return null;
      const a = left;
      left = minus ? (x) => a(x) - right(x) : (x) => a(x) + right(x);
    }
    return left;
  }

  /** Produit, avec la multiplication sous-entendue : `3x`, `2(x + 1)`, `x sqrt(x)`. */
  private product(): Expression | null {
    let left = this.power();
    while (left) {
      const token = this.peek();
      let divide = false;
      if (this.isOp('*') || this.isOp('/')) {
        divide = this.isOp('/');
        this.index++;
      } else if (!token || !['number', 'x', 'pi', 'fn', 'open'].includes(token.kind)) {
        break;
      }
      const right = this.power();
      if (!right) return null;
      const a = left;
      left = divide ? (x) => a(x) / right(x) : (x) => a(x) * right(x);
    }
    return left;
  }

  /** Puissance, associative à droite : `2^x^2` = 2^(x^2). Le signe s'applique après : `-x^2` = -(x^2). */
  private power(): Expression | null {
    const base = this.signed();
    if (!base || !this.isOp('^')) return base;
    this.index++;
    const exponent = this.power();
    return exponent ? (x) => Math.pow(base(x), exponent(x)) : null;
  }

  private signed(): Expression | null {
    if (this.isOp('-') || this.isOp('+')) {
      const minus = this.isOp('-');
      this.index++;
      const operand = this.power();
      if (!operand) return null;
      return minus ? (x) => -operand(x) : operand;
    }
    return this.primary();
  }

  private primary(): Expression | null {
    const token = this.peek();
    if (!token || ++this.depth > MAX_DEPTH) return null;
    this.index++;
    switch (token.kind) {
      case 'number':
        return () => token.value;
      case 'x':
        return (x) => x;
      case 'pi':
        return () => Math.PI;
      case 'fn': {
        const argument = this.group();
        if (!argument) return null;
        return token.name === 'sqrt' ? (x) => Math.sqrt(argument(x)) : (x) => Math.abs(argument(x));
      }
      case 'open': {
        this.index--;
        return this.group();
      }
      default:
        return null;
    }
  }

  private group(): Expression | null {
    if (this.peek()?.kind !== 'open') return null;
    this.index++;
    const inner = this.sum();
    if (!inner || this.peek()?.kind !== 'close') return null;
    this.index++;
    return inner;
  }
}

/**
 * Expression lue, ou null si elle est mal écrite ou trop longue. `y = …` et `f(x) = …` sont acceptés.
 */
export function parseExpression(source: string): Expression | null {
  if (source.length > MAX_LENGTH) return null;
  const body = normalize(source).replace(/^(y|f\(x\))=/, '');
  const tokens = tokenize(body);
  if (!tokens || tokens.length === 0) return null;
  return new Parser(tokens).parse();
}
