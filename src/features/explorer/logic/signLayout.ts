/*
 * Placement des panneaux de région autour de l'île (X2a) : chaque panneau se pose juste hors de
 * l'île, dans la direction de sa région vue du centre de l'île, et un trait le relie au point de la
 * région qu'il désigne. Les panneaux ne se recouvrent pas et restent entièrement à l'écran.
 */

export type Pt = { x: number; y: number };
export type Size = { width: number; height: number };

export type SignPlacement = {
  left: number;
  top: number;
  /** Point de la bordure du panneau le plus proche de la région : là où le trait s'accroche. */
  attach: Pt;
};

export type SignInput = {
  id: string;
  /** Point de la région à l'écran, où le trait se termine. */
  anchor: Pt;
  /** Point du bord de l'île dans la direction de la région, à l'écran : le panneau se pose au-delà. */
  edge: Pt;
};

type Bounds = { top: number; bottom: number };

type LayoutOptions = {
  sign: Size;
  screen: Size;
  centre: Pt;
  /** Zone verticale où les panneaux peuvent se poser (sous la consigne, au-dessus du panneau de région). */
  bounds: Bounds;
  margin?: number;
  gap?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Panneau posé au-delà du bord de l'île, sur la ligne centre → bord, contre l'écran si besoin. */
export function placeSign(input: SignInput, options: LayoutOptions): SignPlacement {
  const { sign, screen, centre, bounds, margin = 8, gap = 10 } = options;
  let dx = input.edge.x - centre.x;
  let dy = input.edge.y - centre.y;
  const length = Math.hypot(dx, dy) || 1;
  dx /= length;
  dy /= length;
  // Distance pour que le panneau, centré sur la ligne, ne touche plus le bord : ses demi-dimensions
  // projetées sur la direction.
  const push = Math.abs(dx) * (sign.width / 2) + Math.abs(dy) * (sign.height / 2) + gap;
  const cx = input.edge.x + dx * push;
  const cy = input.edge.y + dy * push;
  const left = clamp(cx - sign.width / 2, margin, screen.width - sign.width - margin);
  const top = clamp(cy - sign.height / 2, bounds.top, bounds.bottom - sign.height);
  return { left, top, attach: attachPoint(input.anchor, { left, top }, sign) };
}

function attachPoint(anchor: Pt, rect: { left: number; top: number }, sign: Size): Pt {
  return {
    x: clamp(anchor.x, rect.left, rect.left + sign.width),
    y: clamp(anchor.y, rect.top, rect.top + sign.height),
  };
}

/**
 * Place tous les panneaux, puis écarte ceux qui se recouvrent. Deux panneaux se recouvrent quand
 * ils se chevauchent aussi en largeur : ceux-là seulement sont empilés, du plus haut au plus bas,
 * puis remontés d'un bloc si la pile dépasse la zone permise. Les traits sont recalculés ensuite.
 */
export function placeSigns(
  inputs: readonly SignInput[],
  options: LayoutOptions,
): Map<string, SignPlacement> {
  const { sign, bounds } = options;
  const gap = 6;
  const placed = inputs.map((input) => ({ input, ...placeSign(input, options) }));
  const sharesColumn = (a: { left: number }, b: { left: number }) =>
    Math.abs(a.left - b.left) < sign.width;
  const byTop = [...placed].sort((a, b) => a.top - b.top);
  // Vers le bas : chaque panneau passe sous ceux qui le recouvrent déjà.
  byTop.forEach((current, i) => {
    for (const above of byTop.slice(0, i)) {
      if (sharesColumn(current, above))
        current.top = Math.max(current.top, above.top + sign.height + gap);
    }
  });
  // Vers le haut : ce qui dépasse le bas de la zone remonte, en poussant ceux du dessus.
  for (let i = byTop.length - 1; i >= 0; i--) {
    const current = byTop[i]!;
    current.top = Math.min(current.top, bounds.bottom - sign.height);
    for (const below of byTop.slice(i + 1)) {
      if (sharesColumn(current, below))
        current.top = Math.min(current.top, below.top - sign.height - gap);
    }
    current.top = Math.max(current.top, bounds.top);
  }
  return new Map(
    placed.map((p) => [
      p.input.id,
      { left: p.left, top: p.top, attach: attachPoint(p.input.anchor, p, sign) },
    ]),
  );
}
