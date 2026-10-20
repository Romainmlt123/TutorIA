import type { AvatarLook } from '../logic/avatarLook';
import bodyZones from './bodyZones.json';

export const SLOT_PREFIX = {
  top: 'haut-',
  bottom: 'bas-',
  shoes: 'chaussures-',
  hat: 'tete-',
  glasses: 'visage-',
  neck: 'cou-',
  back: 'dos-',
} as const;

export const SLOTS = Object.keys(SLOT_PREFIX) as (keyof typeof SLOT_PREFIX)[];

export function visiblePieces(look: AvatarLook): Set<string> {
  const worn = SLOTS.filter((slot) => look.outfit[slot].item !== 'aucun').map(
    (slot) => `${SLOT_PREFIX[slot]}${look.outfit[slot].item}`,
  );
  const visible = new Set(['corps', 'tete', `cheveux-${look.hair.style}`, ...worn]);
  for (const [zone, masks] of Object.entries(bodyZones)) {
    if (zone !== 'corps' && !masks.some((piece) => worn.includes(piece))) visible.add(zone);
  }
  return visible;
}
