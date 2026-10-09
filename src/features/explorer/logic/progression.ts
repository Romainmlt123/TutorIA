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
  /** Dernière partie (date ISO) : elle place le pion et la carte « Reprendre ». */
  lastPlayedAt?: string;
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
  playedAt?: string,
): LevelRecord {
  const bestScore = Math.max(previous?.bestScore ?? 0, result.score);
  const lastPlayedAt = playedAt ?? previous?.lastPlayedAt;
  return {
    levelId,
    finished: true,
    bestScore,
    stars: Math.max(previous?.stars ?? 0, result.stars) as Stars,
    attempts: (previous?.attempts ?? 0) + 1,
    ...(lastPlayedAt ? { lastPlayedAt } : null),
  };
}

/**
 * XP accordée à la fin d'une partie (même règle que `finish_level` en base) : 10 XP la première
 * fois que le niveau est terminé, réussi ou non, et 10 XP par étoile ; rejouer ne rapporte que
 * les étoiles nouvelles.
 */
export function awardedXp(previous: LevelRecord | undefined, result: LevelResult): number {
  const before = previous?.finished ? XP_BASE + XP_PER_STAR * previous.stars : 0;
  const after = XP_BASE + XP_PER_STAR * Math.max(previous?.stars ?? 0, result.stars);
  return Math.max(0, after - before);
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

function evaluationOf(city: City): Level | undefined {
  return city.levels.find((level) => level.type === 'evaluation');
}

/** Villes de l'île, dans l'ordre de la carte. */
function citiesOf(island: Island): City[] {
  return island.regions.flatMap((region) => region.cities);
}

/**
 * Prérequis d'une ville qui ne sont pas encore levés : les villes à écrire ne comptent pas, et
 * un prérequis est levé quand son évaluation a été tentée (validée ou à consolider).
 */
export function missingRequirements(island: Island, city: City, records: Records): City[] {
  const byId = new Map(citiesOf(island).map((c) => [c.id, c]));
  return (city.requires ?? [])
    .map((id) => byId.get(id))
    .filter((required): required is City => required !== undefined && required.playable)
    .filter((required) => {
      const evaluation = evaluationOf(required);
      return !(evaluation && records.get(evaluation.id)?.finished);
    });
}

/** Une ville est ouverte quand ses prérequis sont levés, ou dès qu'un de ses niveaux a été joué. */
export function isCityOpen(island: Island, city: City, records: Records): boolean {
  if (!city.playable) return false;
  if (city.levels.some((level) => records.get(level.id)?.finished)) return true;
  return missingRequirements(island, city, records).length === 0;
}

/**
 * États des niveaux d'une île. Les villes s'ouvrent selon leurs prérequis (plusieurs peuvent être
 * ouvertes en même temps) ; dans une ville, les niveaux s'ouvrent dans l'ordre : un niveau est
 * ouvert quand tous ceux d'avant sont franchis. Les villes encore à écrire restent verrouillées et
 * ne bloquent rien. Un niveau terminé n'est jamais reverrouillé.
 */
export function islandPath(island: Island, records: Records): readonly PlacedLevel[] {
  const open = new Map(
    citiesOf(island).map((city) => [city.id, isCityOpen(island, city, records)]),
  );
  const blockedCities = new Set<string>();
  return pathOf(island).map((place) => {
    const record = records.get(place.level.id);
    const playable = place.city.playable;
    const stars = record?.stars ?? 0;
    const completed = { ...place, state: 'completed' as const, stars, playable };
    const locked = { ...place, state: 'locked' as const, stars, playable };
    if (isCleared(place.level, record)) return completed;
    if (!open.get(place.city.id) || blockedCities.has(place.city.id)) {
      return record?.finished ? completed : locked;
    }
    blockedCities.add(place.city.id);
    return { ...place, state: 'active' as const, stars, playable };
  });
}

/** Premier niveau ouvert de l'île, dans l'ordre de la carte. */
export function activeLevel(path: readonly PlacedLevel[]): PlacedLevel | undefined {
  return path.find((p) => p.state === 'active');
}

/**
 * Niveau du pion et de « Reprendre » : le niveau ouvert de la ville jouée le plus récemment,
 * sinon le premier niveau ouvert de l'île.
 */
export function currentLevel(
  path: readonly PlacedLevel[],
  records: Records,
): PlacedLevel | undefined {
  let lastCity: string | undefined;
  let lastTime = '';
  for (const place of path) {
    const playedAt = records.get(place.level.id)?.lastPlayedAt;
    if (playedAt && playedAt > lastTime) {
      lastTime = playedAt;
      lastCity = place.city.id;
    }
  }
  return path.find((p) => p.state === 'active' && p.city.id === lastCity) ?? activeLevel(path);
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
  const cities = citiesOf(island);
  return {
    citiesDone: cities.filter((city) => cityStatus(city, path, records) === 'done').length,
    citiesTotal: cities.length,
    stars: path.reduce((sum, p) => sum + p.stars, 0),
    next: currentLevel(path, records),
    started: path.some((p) => records.get(p.level.id)?.finished),
  };
}

export type RegionStatus = 'discover' | 'current' | 'consolidate' | 'done';

export type RegionSummary = {
  regionId: string;
  citiesDone: number;
  citiesTotal: number;
  stars: number;
  /** Villes dont le Bilan est sous 70 % : à consolider. */
  toConsolidate: number;
  /** Première région de la liste (ou seule) qui a du travail ouvert : la prochaine étape. */
  next: PlacedLevel | undefined;
  status: RegionStatus;
};

/**
 * Résumé d'une région (panneaux de X2a) : villes validées, étoiles, villes à consolider, prochaine
 * étape, et état. « À découvrir » tant qu'aucun niveau de la région n'a été joué et qu'elle n'a pas
 * été visitée (`seen`, mémorisé sur l'appareil par l'écran).
 */
export function regionSummary(
  island: Island,
  regionId: string,
  records: Records,
  seen: ReadonlySet<string> = new Set(),
): RegionSummary {
  const region = island.regions.find((r) => r.id === regionId);
  const path = islandPath(island, records);
  const cities = region?.cities ?? [];
  const inRegion = path.filter((p) => p.region.id === regionId);
  const statuses = cities.map((city) => cityStatus(city, path, records));
  const citiesDone = statuses.filter((status) => status === 'done').length;
  const toConsolidate = statuses.filter((status) => status === 'consolidate').length;
  const played = inRegion.some((p) => records.get(p.level.id)?.finished);
  let status: RegionStatus = 'current';
  if (cities.length > 0 && citiesDone === cities.length) status = 'done';
  else if (toConsolidate > 0) status = 'consolidate';
  else if (!played && !seen.has(regionId)) status = 'discover';
  return {
    regionId,
    citiesDone,
    citiesTotal: cities.length,
    stars: inRegion.reduce((sum, p) => sum + p.stars, 0),
    toConsolidate,
    next: currentLevel(inRegion, records),
    status,
  };
}
