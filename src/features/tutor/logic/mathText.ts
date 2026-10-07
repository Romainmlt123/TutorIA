import { parseEmphasis } from './emphasis';

/*
 * Formules du tuteur : il écrit ses calculs en LaTeX, entre $…$ dans la phrase et entre $$…$$ pour
 * un calcul seul sur sa ligne. Ce module découpe un message en paragraphes à afficher (fonction
 * pure). Une formule pas encore fermée (réponse en cours d'arrivée) reste du texte.
 */

export type InlinePiece =
  { kind: 'text'; text: string; italic: boolean } | { kind: 'math'; tex: string };

export type MessagePart =
  { kind: 'inline'; pieces: InlinePiece[] } | { kind: 'display'; tex: string };

/** Formule seule sur sa ligne : $$…$$ ou \[…\]. */
const DISPLAY = /\$\$([^$]+?)\$\$|\\\[([\s\S]+?)\\\]/g;
/** Formule dans la phrase : $…$ (sur une ligne) ou \(…\). */
const INLINE = /\$([^$\n]+?)\$|\\\(([^\n]+?)\\\)/g;

function inlinePieces(text: string): InlinePiece[] {
  const pieces: InlinePiece[] = [];
  const pushText = (chunk: string) => {
    for (const segment of parseEmphasis(chunk)) pieces.push({ kind: 'text', ...segment });
  };
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    const tex = (match[1] ?? match[2] ?? '').trim();
    const index = match.index ?? 0;
    if (!tex) continue;
    if (index > last) pushText(text.slice(last, index));
    pieces.push({ kind: 'math', tex });
    last = index + match[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return pieces;
}

/** Découpe un message en paragraphes de texte (avec formules et italique) et formules isolées. */
export function parseMathMessage(message: string): MessagePart[] {
  const parts: MessagePart[] = [];
  const pushInline = (text: string) => {
    const trimmed = text.replace(/^\n+|\n+$/g, '');
    if (trimmed) parts.push({ kind: 'inline', pieces: inlinePieces(trimmed) });
  };
  let last = 0;
  for (const match of message.matchAll(DISPLAY)) {
    const tex = (match[1] ?? match[2] ?? '').trim();
    const index = match.index ?? 0;
    if (!tex) continue;
    pushInline(message.slice(last, index));
    parts.push({ kind: 'display', tex });
    last = index + match[0].length;
  }
  pushInline(message.slice(last));
  return parts;
}

/** Texte lu par un lecteur d'écran à la place d'une formule : le LaTeX, sans ses commandes. */
export function spokenTex(tex: string): string {
  return tex
    .replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1 sur $2')
    .replace(/\\sqrt\{([^{}]*)\}/g, 'racine de $1')
    .replace(/\\times/g, ' fois ')
    .replace(/\\div/g, ' divisé par ')
    .replace(/\\leq?/g, ' inférieur ou égal à ')
    .replace(/\\geq?/g, ' supérieur ou égal à ')
    .replace(/\\neq/g, ' différent de ')
    .replace(/\\pi/g, ' pi ')
    .replace(/\^\{?2\}?/g, ' au carré')
    .replace(/\^\{?3\}?/g, ' au cube')
    .replace(/\^\{?([^{}\s]+)\}?/g, ' puissance $1')
    .replace(/\{,\}/g, ',')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
