import type { IconName } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { LevelType } from '../../content';
import type { MapNode } from '../../logic/regionMap';

/*
 * Marques d'un niveau sur la carte d'une région, communes à la carte 3D (MapOverlay) et à la carte
 * pré-rendue (LevelDisc, RegionMapMarkers) : icône, libellé lu par le lecteur d'écran, zone tactile.
 */

/** Côté du bouton posé sur un niveau : la zone tactile minimale. */
export const MAP_TARGET = theme.layout.minTouchSize;

const TYPE_ICON: Record<LevelType, IconName> = {
  lecon: 'livre',
  exercices: 'cible',
  evaluation: 'medaille',
};

/** Icône d'un niveau : celle de son type, ou le cadenas s'il est fermé. */
export function levelIcon(node: Pick<MapNode, 'type' | 'state'>): IconName {
  return node.state === 'locked' ? 'cadenas' : TYPE_ICON[node.type];
}

/** Taille de l'icône (dp) : plus grande sur le disque d'une évaluation. */
export function levelIconSize(type: LevelType): number {
  return type === 'evaluation' ? 26 : 22;
}

/** Épaisseur du trait des icônes de niveau. */
export const LEVEL_ICON_STROKE = 2.4;

export function nodeLabel(node: MapNode): string {
  return fr.explorer.levelLabel(
    fr.explorer.levelTypes[node.type],
    node.title,
    fr.explorer.levelState[node.state],
    node.stars,
  );
}
