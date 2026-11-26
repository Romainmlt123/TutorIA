/*
 * Mesures du compteur de performance des scènes 3D (développement seulement) : temps d'image sur
 * une fenêtre glissante, relevé publié pour l'affichage, et nombre de contextes 3D vus par la sonde ;
 * relevé à part d'une carte pré-rendue, sans 3D (`MapPerf`).
 */

/** Durée couverte par la fenêtre glissante (ms). */
export const FRAME_WINDOW_MS = 2000;

/** Durées des dernières images (ms), de la plus ancienne à la plus récente, et leur somme. */
export type FrameWindow = { deltas: number[]; total: number };

/** Images par seconde, puis temps d'image (ms) : médian, p95 et pire de la fenêtre. */
export type FrameStats = { fps: number; p50: number; p95: number; max: number };

export function createFrameWindow(): FrameWindow {
  return { deltas: [], total: 0 };
}

/**
 * Ajoute la durée d'une image et oublie les plus anciennes au-delà de la fenêtre. Un écart plus
 * long que la fenêtre entière ne dit rien du rythme des images (app en arrière-plan, scène en
 * pause) : la fenêtre repart de zéro. Une durée nulle, négative ou non finie est ignorée.
 */
export function addFrame(window: FrameWindow, deltaMs: number, windowMs = FRAME_WINDOW_MS) {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return;
  if (deltaMs > windowMs) {
    window.deltas.length = 0;
    window.total = 0;
    return;
  }
  window.deltas.push(deltaMs);
  window.total += deltaMs;
  while (window.total > windowMs) window.total -= window.deltas.shift() ?? 0;
}

/** Centile par rang (le plus proche) d'une liste triée. */
function percentile(sorted: readonly number[], p: number): number {
  const rank = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[rank] ?? 0;
}

/**
 * Rythme et temps d'image de la fenêtre ; des zéros si elle est vide. Le pire temps montre un
 * accroc isolé (textures décodées en entrant dans une région), que le p95 ne voit pas.
 */
export function frameStats(window: FrameWindow): FrameStats {
  const count = window.deltas.length;
  if (count === 0 || window.total <= 0) return { fps: 0, p50: 0, p95: 0, max: 0 };
  const sorted = [...window.deltas].sort((a, b) => a - b);
  return {
    fps: count / (window.total / 1000),
    p50: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    max: sorted[count - 1] ?? 0,
  };
}

/** Relevé affiché par le compteur : rythme, travail du rendu et contexte 3D. */
export type PerfSnapshot = FrameStats & {
  /**
   * Attente du fil GL d'expo-gl (ms), mesurée au moment du relevé ; null hors natif. L'image qui
   * suit cette attente reste hors de la fenêtre : le rythme et le pire temps ne comptent pas la sonde.
   */
  glLag: number | null;
  /** Appels de dessin et triangles de toute l'image (scène et passes d'effets). */
  calls: number;
  triangles: number;
  /** Textures et géométries présentes en mémoire graphique. */
  textures: number;
  geometries: number;
  /**
   * Identifiant du contexte expo-gl (natif, croissant pour tous les GLView depuis le lancement),
   * et nombre de contextes vus par la sonde, donc seulement pendant que le compteur est allumé.
   */
  contextId: number | null;
  contexts: number;
  /**
   * Densité réelle du rendu de la scène : celle que lui donne Hd2dPost (2 au plus), sinon celle du
   * tampon de dessin (`gl.getPixelRatio()`, plafonnée par `dpr` sur le web seulement).
   */
  renderRatio: number;
};

let current: PerfSnapshot | null = null;
const listeners = new Set<() => void>();

/** Publie un relevé (null : plus de scène mesurée), lu avec `useSyncExternalStore`. */
export function publishPerf(snapshot: PerfSnapshot | null) {
  current = snapshot;
  listeners.forEach((listener) => listener());
}

export function subscribePerf(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPerf(): PerfSnapshot | null {
  return current;
}

/**
 * Relevé d'une carte pré-rendue, sur le fil de l'interface (`useMapClock`, toutes les demi-secondes) :
 * le rythme de son horloge (`rate` : 30 pas par seconde au plus, 0 quand ses animations sont figées),
 * puis les images du fil de l'interface : leur nombre par seconde, leur p95 et leur pire durée (ms),
 * et celles en retard (`late` : plus d'une fois et demie l'image médiane, au moins une image d'écran
 * manquée). Valeurs arrondies, telles qu'affichées.
 */
export type MapPerf = { rate: number; fps: number; p95: number; max: number; late: number };

/** Une image est en retard au-delà de cette part de l'image médiane de la fenêtre. */
const LATE_FACTOR = 1.5;

/**
 * Relevé d'une fenêtre : les pas de l'horloge, puis la durée de chaque image (ms) ; des zéros sans
 * image. La durée médiane sert d'image d'écran : un écran à fréquence variable change la sienne.
 */
export function mapPerfOf(ticks: number, deltas: readonly number[]): MapPerf {
  const frames = deltas.filter((delta) => Number.isFinite(delta) && delta > 0);
  const total = frames.reduce((sum, delta) => sum + delta, 0);
  if (total <= 0) return { rate: 0, fps: 0, p95: 0, max: 0, late: 0 };
  const { fps, p50, p95, max } = frameStats({ deltas: frames, total });
  return {
    rate: Math.round(ticks / (total / 1000)),
    fps: Math.round(fps),
    p95: Math.round(p95),
    max: Math.round(max),
    late: frames.filter((delta) => delta > LATE_FACTOR * p50).length,
  };
}

let mapPerf: MapPerf | null = null;

const sameMapPerf = (a: MapPerf | null, b: MapPerf | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    (Object.keys(a) as (keyof MapPerf)[]).every((key) => a[key] === b[key]));

/**
 * Publie le relevé d'une carte pré-rendue (null : plus de carte mesurée). Les abonnés ne sont
 * prévenus que s'il change : chaque affichage du compteur est un commit React, qui suspend les
 * mises à jour de Reanimated, donc le défilement mesuré.
 */
export function publishMapPerf(next: MapPerf | null) {
  if (sameMapPerf(mapPerf, next)) return;
  mapPerf = next;
  listeners.forEach((listener) => listener());
}

export function getMapPerf(): MapPerf | null {
  return mapPerf;
}

const seenContexts = new WeakSet<object>();
let contextCount = 0;

/**
 * Compte un contexte 3D la première fois que la sonde le voit, et rend le nombre de contextes vus
 * depuis le lancement : un nombre qui grimpe prouve que la scène a été recréée. Un contexte créé
 * pendant que le compteur est éteint n'est pas compté (l'identifiant expo-gl, lui, le montre).
 */
export function countContext(context: object): number {
  if (!seenContexts.has(context)) {
    seenContexts.add(context);
    contextCount += 1;
  }
  return contextCount;
}
