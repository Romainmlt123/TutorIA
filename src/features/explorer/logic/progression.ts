import {
  pathOf,
  type City,
  type Island,
  type Level,
  type LevelPlace,
  type LevelType,
} from '../content';

/*
 * Règles de progression d'Explorer (fonctions pures). Le serveur les applique aux réponses
 * enregistrées : l'app ne calcule jamais un score qu'elle enverrait.
 */

/** Réponse enregistrée pendant une discussion (appel d'outil `record_answer`, côté serveur). */
export type RecordedAnswer = { correct: boolean; hinted: boolean };

/** Meilleur résultat d'un élève sur un niveau. */
export type LevelRecord = {
  levelId: string;
  /** Le niveau a été mené jusqu'au bilan au moins une fois. */
  finished: boolean;
  /** Meilleur score, de 0 à 1 ; null tant que le niveau n'a pas été terminé. */
  bestScore: number | null;
  stars: Stars;
  attempts: number;
};

export type Stars = 0 | 1 | 2 | 3;

export type LevelResult = { score: number; stars: Stars; passed: boolean; xp: number };

/** Seuils des étoiles : 50 %, 70 % et 90 %. */
export const STAR_THRESHOLDS = [0.5, 0.7, 0.9] as const;
/** Score à atteindre à l'évaluation pour valider la ville. */
export const CITY_PASS_SCORE = 0.7;
export const XP_BASE = 10;
export const XP_PER_STAR = 10;

export function starsFor(score: number): Stars {
  return STAR_THRESHOLDS.filter((threshold) => score >= threshold).length as Stars;
}

/**
 * Score d'un niveau : 1 point par réponse juste, un demi-point si elle a demandé un indice
 * (aucun en évaluation, où le tuteur n'aide pas), rapporté au nombre de questions prévues.
 * Une question passée ou manquante compte 0.
 */
export function scoreOf(
  type: LevelType,
  answers: readonly RecordedAnswer[],
  expected: number,
): number {
  if (expected <= 0) return 0;
  const hintWeight = type === 'evaluation' ? 0 : 0.5;
  const points = answers
    .slice(0, expected)
    .reduce((sum, a) => sum + (a.correct ? (a.hinted ? hintWeight : 1) : 0), 0);
  return Math.min(1, points / expected);
}

/**
 * Résultat d'un niveau terminé. Une leçon sans question de vérification vaut 100 %.
 * Leçon : validée dès qu'elle est terminée. Exercices : au moins une étoile. Évaluation : 70 %.
 */
export function levelResult(level: Level, answers: readonly RecordedAnswer[]): LevelResult {
  const score =
    level.type === 'lecon' && answers.length === 0 ? 1 : scoreOf(level.type, answers, level.steps);
  const stars = starsFor(score);
  const passed =
    level.type === 'lecon'
      ? true
      : level.type === 'exercices'
        ? stars >= 1
        : score >= CITY_PASS_SCORE;
  return { score, stars, passed, xp: XP_BASE + XP_PER_STAR * stars };
}

/** Garde le meilleur résultat : rien ne se perd en rejouant un niveau. */
export function mergeAttempt(
  previous: LevelRecord | undefined,
  levelId: string,
  result: LevelResult,
): LevelRecord {
  const bestScore = Math.max(previous?.bestScore ?? 0, result.score);
  return {
    levelId,
    finished: true,
    bestScore,
    stars: Math.max(previous?.stars ?? 0, result.stars) as Stars,
    attempts: (previous?.attempts ?? 0) + 1,
  };
}

/** Un niveau est franchi quand il ouvre le suivant : leçon terminée, exercices avec une étoile, évaluation tentée. */
export function isCleared(level: Level, record: LevelRecord | undefined): boolean {
  if (!record?.finished) return false;
  if (level.type === 'exercices') return record.stars >= 1;
  return true;
}

export type LevelState = 'completed' | 'active' | 'locked';
export type CityStatus = 'done' | 'current' | 'consolidate' | 'locked';

export type PlacedLevel = LevelPlace & {
  state: LevelState;
  stars: Stars;
  /** Faux pour une ville encore à écrire : visible sur la carte, annoncée « Bientôt ». */
  playable: boolean;
};

export type Records = ReadonlyMap<string, LevelRecord>;

/**
 * États des niveaux d'une île. Ils s'ouvrent dans l'ordre du chemin : un niveau est ouvert quand
 * tous les niveaux jouables avant lui sont franchis. Les villes encore à écrire ne bloquent pas le
 * chemin. Le niveau en cours (le pion) est le premier niveau jouable non franchi.
 */
export function islandPath(island: Island, records: Records): readonly PlacedLevel[] {
  let blocked = false;
  return pathOf(island).map((place) => {
    const record = records.get(place.level.id);
    const playable = place.city.playable;
    const stars = record?.stars ?? 0;
    if (!playable) return { ...place, state: 'locked', stars, playable };
    if (blocked)
      return { ...place, state: record?.finished ? 'completed' : 'locked', stars, playable };
    if (isCleared(place.level, record)) return { ...place, state: 'completed', stars, playable };
    blocked = true;
    return { ...place, state: 'active', stars, playable };
  });
}

export function activeLevel(path: readonly PlacedLevel[]): PlacedLevel | undefined {
  return path.find((p) => p.state === 'active');
}

function evaluationOf(city: City): Level | undefined {
  return city.levels.find((level) => level.type === 'evaluation');
}

/** Statut d'une ville (bannière) : validée à 70 % à l'évaluation, à consolider en dessous. */
export function cityStatus(city: City, path: readonly PlacedLevel[], records: Records): CityStatus {
  const evaluation = evaluationOf(city);
  const record = evaluation ? records.get(evaluation.id) : undefined;
  if (record?.finished) return (record.bestScore ?? 0) >= CITY_PASS_SCORE ? 'done' : 'consolidate';
  return path.some((p) => p.city.id === city.id && p.state === 'active') ? 'current' : 'locked';
}

/**
 * Maîtrise d'une ville, de 0 à 1 : moyenne des meilleurs scores de ses exercices et de son évaluation.
 * Null tant qu'aucun n'est terminé (la maîtrise du chapitre reste alors celle des flashcards).
 */
export function cityMastery(city: City, records: Records): number | null {
  const scores = city.levels
    .filter((level) => level.type !== 'lecon')
    .map((level) => records.get(level.id))
    .filter(
      (record): record is LevelRecord => record?.finished === true && record.bestScore !== null,
    )
    .map((record) => record.bestScore as number);
  if (scores.length === 0) return null;
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

export type IslandSummary = {
  citiesDone: number;
  citiesTotal: number;
  stars: number;
  next: PlacedLevel | undefined;
  started: boolean;
};

/** Carte de progression de X1 : villes validées, étoiles, prochaine étape. */
export function islandSummary(island: Island, records: Records): IslandSummary {
  const path = islandPath(island, records);
  const cities = island.regions.flatMap((region) => region.cities);
  return {
    citiesDone: cities.filter((city) => cityStatus(city, path, records) === 'done').length,
    citiesTotal: cities.length,
    stars: path.reduce((sum, p) => sum + p.stars, 0),
    next: activeLevel(path),
    started: path.some((p) => records.get(p.level.id)?.finished),
  };
}
