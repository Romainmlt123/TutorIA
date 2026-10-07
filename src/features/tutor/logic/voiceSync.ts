import { VISUAL_TONES, type VisualTone } from '@/services/tutor/visuals';

/** Une couleur nommée, avec ses accords (« la droite rouge », « les droites bleues »). */
const TONE_WORD = new RegExp(
  `^(${VISUAL_TONES.join('|')})(e|s|es|te|tes)?$`.replace('violet)', 'violet|violett)'),
  'i',
);

const toneOf = (word: string): VisualTone | null => {
  const bare = word.toLowerCase().replace(/[.,;:!?»«"()]/g, '');
  const match = TONE_WORD.exec(bare)?.[1];
  if (!match) return null;
  const root = match.startsWith('violet') ? 'violet' : match;
  return (VISUAL_TONES as readonly string[]).includes(root) ? (root as VisualTone) : null;
};

/** Dernière couleur nommée par le tuteur dans sa phrase : la courbe à mettre en avant (2D). */
export function namedTone(text: string): VisualTone | null {
  const words = text.split(/\s+/);
  for (let i = words.length - 1; i >= 0; i--) {
    const tone = toneOf(words[i] ?? '');
    if (tone) return tone;
  }
  return null;
}

/** Rythme d'écriture du tableau quand la phrase ne donne aucun repère (2F). */
export const BOARD_STEP_MS = 1600;

/**
 * Lignes du tableau déjà écrites : une de plus à chaque pas pendant que le tuteur parle, toutes
 * quand il a fini sa phrase.
 */
export function boardProgress(steps: number, elapsedMs: number, finished: boolean): number {
  if (finished) return steps;
  return Math.min(steps, 1 + Math.floor(Math.max(0, elapsedMs) / BOARD_STEP_MS));
}

export type CaptionPiece =
  | { kind: 'text'; text: string }
  | { kind: 'number'; text: string }
  | { kind: 'color'; text: string; tone: VisualTone };

const NUMBER = /\d|[=+×÷−<>]/;

/**
 * Sous-titres : les nombres et les formules en gras, chaque couleur nommée dans une pastille de sa
 * couleur. Les mots ordinaires voisins sont regroupés.
 */
export function captionPieces(text: string): CaptionPiece[] {
  const pieces: CaptionPiece[] = [];
  const push = (piece: CaptionPiece) => {
    const last = pieces.at(-1);
    if (piece.kind !== 'color' && last && last.kind === piece.kind) last.text += piece.text;
    else pieces.push(piece);
  };
  for (const token of text.split(/(\s+)/)) {
    if (!token) continue;
    const last = pieces.at(-1);
    if (/^\s+$/.test(token)) {
      // Une espace prolonge le texte ou la formule en cours, jamais une pastille de couleur.
      if (last && last.kind !== 'color') last.text += token;
      else pieces.push({ kind: 'text', text: token });
      continue;
    }
    const tone = toneOf(token);
    if (tone) {
      // La ponctuation qui suit la couleur reste hors de la pastille.
      const [, word = token, punctuation = ''] = /^(.*?)([.,;:!?»"()]*)$/.exec(token) ?? [];
      pieces.push({ kind: 'color', text: word, tone });
      if (punctuation) push({ kind: 'text', text: punctuation });
    } else {
      push(NUMBER.test(token) ? { kind: 'number', text: token } : { kind: 'text', text: token });
    }
  }
  return pieces;
}

/** Sous-titre court (2D, 2F) : la fin de la phrase reste visible, coupée au début sur un mot. */
export function captionTail(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const start = text.length - maxChars;
  // Coupure sur un début de mot : soit pile au début d'un mot, soit au mot suivant.
  const from = text[start - 1] === ' ' ? start : text.indexOf(' ', start) + 1 || start;
  return `… ${text.slice(from)}`;
}
