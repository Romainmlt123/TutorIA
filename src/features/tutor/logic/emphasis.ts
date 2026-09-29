export type TextSegment = { text: string; italic: boolean };

/**
 * Découpe un message en segments : *notion* passe en italique (mise en valeur d'une notion).
 * Aucune autre mise en forme n'est interprétée.
 */
export function parseEmphasis(message: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pattern = /\*([^*\n]+)\*/g;
  let last = 0;
  for (const match of message.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) segments.push({ text: message.slice(last, index), italic: false });
    segments.push({ text: match[1] ?? '', italic: true });
    last = index + match[0].length;
  }
  if (last < message.length) segments.push({ text: message.slice(last), italic: false });
  return segments;
}
