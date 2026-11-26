import { fr } from '@/i18n/fr';

import { honeyGaps } from './mapMarkers';
import type { CityStatus, Stars } from './progression';
import type { RegionMap } from './regionMap';

/*
 * Ce qui a changé sur la carte d'une région depuis que l'élève l'a vue : étoiles gagnées, tronçons
 * du chemin parcourus, niveaux ouverts, villes validées ou à consolider. Deux cartes calculées à
 * partir des résultats sont comparées (fonctions pures) : seule une vraie progression, le résultat
 * d'un niveau, est célébrée, jamais un défilement.
 */

export type StarGain = {
  levelId: string;
  /** Étoiles avant et après : les nouvelles sont celles de rang `from` à `to - 1`. */
  from: Stars;
  to: Stars;
  /** Niveau terminé pour la première fois : sa rangée d'étoiles apparaît. */
  firstTime: boolean;
};

export type CityChange = { cityId: string; from: CityStatus; to: 'done' | 'consolidate' };

export type MapProgress = {
  /** Niveaux qui ont gagné des étoiles ou viennent d'être terminés, dans l'ordre du chemin. */
  stars: readonly StarGain[];
  /** Tronçons du chemin devenus miel (`gap` : entre les niveaux gap et gap + 1), dans l'ordre. */
  gaps: readonly number[];
  /** Niveaux qui viennent de s'ouvrir, dans l'ordre du chemin. */
  unlocked: readonly string[];
  /** Villes validées pour la première fois, ou devenues « à consolider ». */
  cities: readonly CityChange[];
};

/** Nouvel état d'une ville à célébrer : validée pour la première fois, ou bilan tenté sous 70 %. */
function cityChange(from: CityStatus, to: CityStatus): CityChange['to'] | null {
  if (to === 'done' && from !== 'done') return 'done';
  if (to === 'consolidate' && from !== 'consolidate' && from !== 'done') return 'consolidate';
  return null;
}

/**
 * Progression entre la carte vue la dernière fois (`before`) et la carte d'aujourd'hui, ou null s'il
 * n'y a rien à célébrer (première visite, autre région, résultats inchangés). Les tronçons nouveaux
 * sont ceux qui sont miel aujourd'hui (honeyGaps) et ne l'étaient pas. Un niveau absent de l'ancienne
 * carte (contenu modifié) n'est pas célébré.
 */
export function progressSince(before: RegionMap | undefined, map: RegionMap): MapProgress | null {
  if (!before || before.regionId !== map.regionId) return null;
  const old = new Map(before.nodes.map((node) => [node.levelId, node]));
  const stars: StarGain[] = [];
  const unlocked: string[] = [];
  for (const node of map.nodes) {
    const previous = old.get(node.levelId);
    if (!previous) continue;
    const firstTime = node.state === 'completed' && previous.state !== 'completed';
    if (node.stars > previous.stars || firstTime) {
      const from = Math.min(previous.stars, node.stars) as Stars;
      stars.push({ levelId: node.levelId, from, to: node.stars, firstTime });
    }
    if (previous.state === 'locked' && node.state !== 'locked') unlocked.push(node.levelId);
  }
  const wasHoney = new Set(honeyGaps(before.nodes, before.pawnIndex));
  const gaps = honeyGaps(map.nodes, map.pawnIndex).filter((gap) => !wasHoney.has(gap));
  const oldCities = new Map(before.cities.map((city) => [city.id, city.status]));
  const cities = map.cities.flatMap((city): CityChange[] => {
    const from = oldCities.get(city.id);
    const to = from ? cityChange(from, city.status) : null;
    return from && to ? [{ cityId: city.id, from, to }] : [];
  });
  if (stars.length + gaps.length + unlocked.length + cities.length === 0) return null;
  return { stars, gaps, unlocked, cities };
}

/**
 * Annonce du lecteur d'écran, dans l'ordre de la célébration : étoiles gagnées, villes, niveaux
 * ouverts. Une ville à consolider est dite avec des mots d'encouragement, jamais comme un échec.
 */
export function progressMessage(progress: MapProgress, map: RegionMap): string {
  const T = fr.explorer.celebration;
  const nodeOf = (levelId: string) => map.nodes.find((node) => node.levelId === levelId);
  const parts: string[] = [];
  for (const gain of progress.stars) {
    const node = nodeOf(gain.levelId);
    const earned = gain.to - gain.from;
    if (node && earned > 0) {
      parts.push(T.stars(earned, fr.explorer.levelTypes[node.type], node.title));
    }
  }
  for (const change of progress.cities) {
    const city = map.cities.find((c) => c.id === change.cityId);
    if (!city) continue;
    parts.push(change.to === 'done' ? T.cityDone(city.name) : T.cityConsolidate(city.name));
  }
  for (const levelId of progress.unlocked) {
    const node = nodeOf(levelId);
    if (node) parts.push(T.unlocked(fr.explorer.levelTypes[node.type], node.title));
  }
  return parts.join(' ');
}
