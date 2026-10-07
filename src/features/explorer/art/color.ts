import { theme } from '@/theme';

/**
 * Teintes dérivées de la palette pour l'illustration (ombre, lumière, contour) : jamais de couleur
 * inventée, toujours un mélange d'une couleur de la palette avec du blanc ou une encre sombre.
 */

function parse(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}

function format([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b]
    .map((c) =>
      Math.round(Math.max(0, Math.min(255, c)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/** Mélange linéaire de deux couleurs, t de 0 (a) à 1 (b). */
export function mix(a: string, b: string, t: number): string {
  const ca = parse(a);
  const cb = parse(b);
  return format([0, 1, 2].map((i) => ca[i]! + (cb[i]! - ca[i]!) * t) as [number, number, number]);
}

const WHITE = theme.colors.surface;
/** Encre bleutée des ombres et des contours (gray-800). */
const INK = theme.palette.gray[800];

/** Éclaircit (t > 0) vers le blanc ou assombrit (t < 0) vers une encre bleutée. */
export function shade(color: string, t: number): string {
  return t >= 0 ? mix(color, WHITE, t) : mix(color, INK, -t);
}

/** Contour d'encre, comme les illustrations d'inspiration : presque noir, teinté par l'objet. */
export function outlineOf(color: string): string {
  return shade(color, -0.82);
}
