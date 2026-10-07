import { levelById, type Level, type LevelType } from '../content';
import type { MapNode, RegionMap } from './regionMap';

/*
 * Fiche d'un niveau (X3, X3b) : pourquoi il est fermé, et la notion à revoir après un bilan raté
 * (fonctions pures).
 */

export type LevelLock =
  /** Les niveaux de la ville ne sont pas encore écrits. */
  | { kind: 'soon' }
  /** La ville attend le Bilan d'autres villes. */
  | { kind: 'city'; names: readonly string[] }
  /** Le Bilan attend les autres niveaux de la ville. */
  | { kind: 'bilan'; remaining: number }
  /** Le niveau attend le précédent. */
  | { kind: 'previous'; type: LevelType; title: string };

/** Raison pour laquelle le niveau ne se joue pas encore, ou null s'il se joue. */
export function lockOf(map: RegionMap, node: MapNode): LevelLock | null {
  if (!levelById(node.levelId)?.city.playable) return { kind: 'soon' };
  if (node.state !== 'locked') return null;
  const city = map.cities.find((c) => c.id === node.cityId);
  if (city && !city.open) return { kind: 'city', names: city.missing };
  const inCity = map.nodes.filter((n) => n.cityId === node.cityId);
  const before = inCity.slice(0, inCity.indexOf(node));
  const todo = before.filter((n) => n.state !== 'completed');
  if (node.type === 'evaluation') return { kind: 'bilan', remaining: todo.length };
  const previous = todo[0] ?? before.at(-1);
  return previous ? { kind: 'previous', type: previous.type, title: previous.title } : null;
}

/**
 * Leçon à revoir après des exercices ou un bilan à consolider : la dernière leçon qui les précède
 * dans la ville (la première de la ville pour le bilan, qui couvre toutes les notions).
 */
export function reviewLessonOf(levelId: string): Level | null {
  const place = levelById(levelId);
  if (!place) return null;
  const { levels } = place.city;
  const lessons = levels.filter((l) => l.type === 'lecon');
  if (place.level.type === 'evaluation') return lessons[0] ?? null;
  const before = levels.slice(0, levels.indexOf(place.level) + 1);
  return before.filter((l) => l.type === 'lecon').at(-1) ?? null;
}
