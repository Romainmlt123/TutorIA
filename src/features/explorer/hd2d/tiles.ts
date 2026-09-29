import { dither, PixelCanvas, seeded, tone } from './pixels';

/*
 * Tuiles répétables du décor HD-2D (pixel art, 16 pixels par unité) : herbe, falaise de terre
 * avec sa bordure d'herbe qui dégouline, roche. Générées par du code, sans fichier image.
 */

/** Bruit de valeur lissé, répétable sur une tuile de `period` pixels. */
function tileNoise(seed: number, period: number, cells: number) {
  const rand = seeded(seed);
  const grid = Array.from({ length: cells * cells }, () => rand());
  return (x: number, y: number) => {
    const fx = (x / period) * cells;
    const fy = (y / period) * cells;
    const x0 = Math.floor(fx);
    const y0 = Math.floor(fy);
    const tx = fx - x0;
    const ty = fy - y0;
    const g = (i: number, j: number) =>
      grid[(((j % cells) + cells) % cells) * cells + (((i % cells) + cells) % cells)]!;
    const a = g(x0, y0) + (g(x0 + 1, y0) - g(x0, y0)) * tx;
    const b = g(x0, y0 + 1) + (g(x0 + 1, y0 + 1) - g(x0, y0 + 1)) * tx;
    return a + (b - a) * ty;
  };
}

/** Herbe vue de dessus : taches tramées, touffes claires, quelques fleurs. */
export function grassTile(size = 64): PixelCanvas {
  const c = new PixelCanvas(size, size);
  const noise = tileNoise(3, size, 4);
  const fine = tileNoise(9, size, 8);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = noise(x, y) * 0.7 + fine(x, y) * 0.3;
      const t =
        n < 0.35
          ? dither(x, y, (0.35 - n) * 4)
            ? 3
            : 4
          : n > 0.68
            ? dither(x, y, (n - 0.68) * 4)
              ? 5
              : 4
            : 4;
      c.set(x, y, tone('green', t));
    }
  }
  const rand = seeded(17);
  // Touffes : un brin clair sur un pied sombre.
  for (let k = 0; k < (size * size) / 70; k++) {
    const x = Math.floor(rand() * size);
    const y = Math.floor(rand() * size);
    c.set(x, y, tone('green', 5));
    c.set(x, (y + 1) % size, tone('green', 4));
    c.set((x + 1) % size, (y + 2) % size, tone('green', 2));
  }
  // Fleurs en croix de 5 pixels, cœur doré.
  const petals = [tone('white', 5), tone('violet', 5), tone('blue', 5), tone('cyan', 5)];
  for (let k = 0; k < size / 10; k++) {
    const x = 1 + Math.floor(rand() * (size - 2));
    const y = 1 + Math.floor(rand() * (size - 2));
    const petal = petals[k % petals.length]!;
    for (const [dx, dy] of [
      [0, -1],
      [-1, 0],
      [1, 0],
      [0, 1],
    ] as const)
      c.set(x + dx, y + dy, petal);
    c.set(x, y, tone('wood', 5));
  }
  return c;
}

/**
 * Falaise de terre (tuile de 32 × 24 : 1,5 unité de haut) : herbe qui dégouline en haut, stries
 * verticales, bande plus claire, cailloux, bas plus sombre.
 */
export function cliffTile(width = 64, height = 48): PixelCanvas {
  const c = new PixelCanvas(width, height);
  const rand = seeded(5);
  const k = height / 24;
  // Coulures d'herbe par colonnes de deux pixels, plus longues de temps en temps.
  const drips = Array.from({ length: width / 2 }, () =>
    Math.round((2 + rand() * 3 + (rand() < 0.2 ? 3.5 : 0)) * k),
  ).flatMap((d) => [d, d]);
  const streaks = Array.from({ length: width }, () => rand() < 0.3);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      if (y < drips[x]!) {
        c.set(x, y, tone('green', y === drips[x]! - 1 ? 2 : y === 0 ? 5 : 3));
        continue;
      }
      const depth = y / height;
      let t = depth > 0.8 ? 1.4 : depth > 0.55 ? 2.4 : 3;
      if (streaks[x] && y > 6 * k) t -= 1;
      if (y >= 10 * k && y <= 11.5 * k) t += 1;
      if (dither(x, y, 0.25)) t -= 0.4;
      c.set(x, y, tone('dirt', t));
    }
  }
  // Cailloux ronds : reflet en haut, ombre en bas.
  for (let n = 0; n < 12; n++) {
    const x = 2 + Math.floor(rand() * (width - 5));
    const y = Math.round(8 * k) + Math.floor(rand() * (height - 12 * k));
    c.circle(x + 1.5, y + 1.5, 1.6 + rand(), (px, py) =>
      tone('dirt', py < y + 1 ? 5 : py > y + 2 ? 2 : 4),
    );
  }
  // Racines fines qui descendent de l'herbe.
  for (let n = 0; n < 5; n++) {
    let x = Math.floor(rand() * width);
    for (let y = Math.round(5 * k); y < Math.round(14 * k); y++) {
      c.set(x, y, tone('dirt', 1));
      if (rand() < 0.3) x = (x + (rand() < 0.5 ? 1 : width - 1)) % width;
    }
  }
  return c;
}

/** Roche : facettes en cellules, arêtes sombres, reflets sur le haut des facettes. */
export function rockTile(size = 64): PixelCanvas {
  const c = new PixelCanvas(size, size);
  const rand = seeded(11);
  const seeds = Array.from(
    { length: 9 },
    () => [rand() * size, rand() * size, 2 + Math.floor(rand() * 3)] as const,
  );
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let best = Infinity;
      let second = Infinity;
      let t = 3;
      for (const [sx, sy, st] of seeds) {
        for (const ox of [-size, 0, size]) {
          for (const oy of [-size, 0, size]) {
            const d = Math.hypot(x - sx - ox, y - sy - oy);
            if (d < best) {
              second = best;
              best = d;
              t = st;
            } else if (d < second) second = d;
          }
        }
      }
      const edgeDist = second - best;
      c.set(
        x,
        y,
        tone('rock', edgeDist < 1.6 ? 2 : edgeDist < 3.4 ? t + 1 : dither(x, y, 0.3) ? t - 0.5 : t),
      );
    }
  }
  return c;
}

/**
 * Motte de terre sous l'île (tuile de 64 × 48) : terre profonde en strates ondulées, racines
 * sombres qui serpentent, quelques rares cailloux. Plus claire en haut pour prolonger la falaise.
 */
export function rootBallTile(width = 64, height = 48): PixelCanvas {
  const c = new PixelCanvas(width, height);
  const rand = seeded(23);
  const wave = tileNoise(31, width, 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const strata = Math.sin((y + wave(x, y) * 10) * 0.45) * 0.5 + 0.5;
      let t = 3 - (y / height) * 1.2 + (strata > 0.72 ? 0.8 : strata < 0.2 ? -0.6 : 0);
      if (dither(x, y, 0.3)) t -= 0.4;
      c.set(x, y, tone('deepDirt', t));
    }
  }
  for (let n = 0; n < 7; n++) {
    let x = Math.floor(rand() * width);
    const start = Math.floor(rand() * height * 0.5);
    for (let y = start; y < Math.min(height, start + 14 + rand() * 18); y++) {
      c.set(x, y, tone('deepDirt', 0));
      c.set((x + 1) % width, y, tone('deepDirt', 1));
      if (rand() < 0.35) x = (x + (rand() < 0.5 ? 1 : width - 1)) % width;
    }
  }
  for (let n = 0; n < 3; n++) {
    const x = 3 + Math.floor(rand() * (width - 7));
    const y = 6 + Math.floor(rand() * (height - 12));
    c.circle(x + 2, y + 2, 2.2, (px, py) => tone('rock', py < y + 1.5 ? 5 : py > y + 3 ? 2 : 4));
  }
  return c;
}
