import type { IslandStageProps } from '../components/IslandStage';
import type { IslandSlide } from '../logic/islands';
import type { IslandFrame } from '../logic/stageFrame';

/*
 * Sur Android, la scène 3D d'Explorer n'est pas dessinée dans l'écran de l'onglet : elle est montée
 * une seule fois à la racine de l'app, sous la pile de navigation (ExplorerStageHost), là où Android
 * ne la retire jamais de la fenêtre et ne détruit donc pas son contexte 3D. L'écran Explorer lui
 * confie ici ce qu'il passait au Canvas, et l'hôte le lit avec `useSyncExternalStore`.
 */

/** Ce que l'écran Explorer confie à l'hôte : sa scène, son image de repli, et si elle se voit. */
export type StageScene = {
  stage: IslandStageProps;
  /** Image fixe montrée si la scène échoue, à la place de l'île. */
  fallback: { slide: IslandSlide; frame: IslandFrame };
  /**
   * L'onglet Explorer est l'onglet choisi, même couvert par un niveau ou l'avatar (`useTabShown`).
   * Faux, la scène est cachée : sous un autre onglet, la transition d'un écran de la pile de la
   * racine laisse voir ce qui est sous elle, et ce doit être le fond de l'app, pas l'île.
   */
  shown: boolean;
};

export type StageStore = {
  /** Null tant qu'Explorer n'a pas été ouvert : l'hôte ne monte rien. */
  scene: StageScene | null;
  listeners: Set<() => void>;
};

export function createStageStore(): StageStore {
  return { scene: null, listeners: new Set() };
}

function change(store: StageStore, scene: StageScene | null) {
  store.scene = scene;
  store.listeners.forEach((listener) => listener());
}

/**
 * L'écran Explorer publie sa scène à chaque rendu, comme quand elle était son enfant : l'hôte se
 * redessine avec lui.
 */
export function publishStage(store: StageStore, scene: StageScene) {
  change(store, scene);
}

/**
 * L'écran Explorer est démonté : la scène ne calcule plus d'images et se cache, car plus rien ne la
 * laisse voir. Elle reste montée, avec son contexte 3D, pour un retour instantané.
 */
export function leaveStage(store: StageStore) {
  const { scene } = store;
  if (!scene || (!scene.stage.active && !scene.shown)) return;
  change(store, { ...scene, stage: { ...scene.stage, active: false }, shown: false });
}

/** Changement d'espace (déconnexion) : la scène est oubliée, la prochaine visite la recrée. */
export function clearStage(store: StageStore) {
  if (store.scene) change(store, null);
}

export function subscribeStage(store: StageStore, listener: () => void): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

/**
 * Essai de la scène dans l'hôte : la clé de son filet (`SceneBoundary`), s'il a échoué, et si
 * Explorer était affiché au dernier rendu.
 */
export type StageAttempt = { key: number; failed: boolean; active: boolean };

/**
 * Suit les visites d'Explorer (`active`). Une scène en échec garde son image de repli jusqu'à la
 * visite suivante, puis elle est retentée sous une nouvelle clé : nouveau Canvas, nouveau contexte
 * 3D. Rien ne change pendant une même visite : un échec durable ne boucle pas.
 */
export function followVisit(attempt: StageAttempt, active: boolean): StageAttempt {
  if (attempt.active === active) return attempt;
  if (active && attempt.failed) return { key: attempt.key + 1, failed: false, active };
  return { ...attempt, active };
}

/** La scène de l'onglet Explorer, partagée par l'écran et l'hôte de la racine. */
export const EXPLORER_STAGE = createStageStore();
