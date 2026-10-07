import type { City, Level, LevelType } from './types';

/** Durée et nombre d'étapes par défaut de chaque type (consignes du tuteur, section 7 du prompt). */
export const LEVEL_DEFAULTS: Record<LevelType, { minutes: number; steps: number }> = {
  lecon: { minutes: 10, steps: 4 },
  exercices: { minutes: 10, steps: 5 },
  evaluation: { minutes: 15, steps: 8 },
};

type LevelSpec = {
  slug: string;
  type: LevelType;
  title: string;
  objectives?: readonly string[];
  steps?: number;
  minutes?: number;
};

/** Construit les niveaux d'une ville, avec des identifiants `<ville>.<niveau>`. */
export function levels(cityId: string, specs: readonly LevelSpec[]): readonly Level[] {
  return specs.map((spec) => ({
    id: `${cityId}.${spec.slug}`,
    type: spec.type,
    title: spec.title,
    objectives: spec.objectives ?? [],
    minutes: spec.minutes ?? LEVEL_DEFAULTS[spec.type].minutes,
    steps: spec.steps ?? LEVEL_DEFAULTS[spec.type].steps,
  }));
}

type CitySpec = Omit<City, 'levels'> & { levels: readonly LevelSpec[] };

export function city(spec: CitySpec): City {
  return { ...spec, levels: levels(spec.id, spec.levels) };
}
