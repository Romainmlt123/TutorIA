import type { SubjectId } from '@/data/types';

/**
 * Contenu d'Explorer : une île par matière, découpée en régions (thèmes), villes (chapitres)
 * et niveaux. Contenu statique, sans React : il est lu aussi par le serveur (consignes du tuteur).
 */

export type LevelType = 'lecon' | 'exercices' | 'evaluation';

/** Programme scolaire de référence : un nouveau programme s'ajoute sans toucher au moteur. */
export type Programme = 'fr-2020';

/** Monument qui représente une ville sur la carte (modèle 3D fabriqué par tools/explorer-3d). */
export type MonumentId = string;

export type Level = {
  /** Identifiant stable, `<ville>.<niveau>` : il est enregistré en base, ne jamais le renommer. */
  id: string;
  type: LevelType;
  title: string;
  /** Objectifs affichés dans la fiche et transmis au tuteur. Vide tant que le niveau n'est pas écrit. */
  objectives: readonly string[];
  /** Durée indicative, en minutes. */
  minutes: number;
  /** Étapes (leçon), exercices ou questions (évaluation) : c'est aussi le dénominateur du score. */
  steps: number;
};

export type City = {
  /** Identifiant du chapitre (catalogue des chapitres, chapter_progress). */
  id: string;
  /** Nom affiché sur la carte : « Ville des Équations ». */
  name: string;
  monument: MonumentId;
  /** Repère officiel dont la ville est tirée. */
  source: string;
  /** Faux tant que les niveaux ne sont pas écrits : la carte les montre, la fiche annonce « Bientôt ». */
  playable: boolean;
  levels: readonly Level[];
};

export type Region = {
  id: string;
  name: string;
  cities: readonly City[];
};

export type Island = {
  subjectId: SubjectId;
  grade: '4e';
  programme: Programme;
  regions: readonly Region[];
};
