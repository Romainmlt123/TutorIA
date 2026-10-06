import type { AvatarLook } from '@/features/avatar/logic/avatarLook';

/**
 * Avatar de l'élève connecté : l'apparence de sa figurine. Elle ne contient aucune donnée
 * personnelle (des rangs dans les palettes et des noms de formes, jamais de photo).
 */
export interface AvatarService {
  /** Apparence enregistrée, ou null si l'élève n'a pas encore créé son avatar. */
  look(accountId: string): Promise<AvatarLook | null>;
  saveLook(accountId: string, look: AvatarLook): Promise<void>;
  /** Garde-robe : objets gagnés (gardés pour toujours) et ceux déjà annoncés à l'élève. */
  wardrobe(accountId: string): Promise<WardrobeRecord>;
  saveWardrobe(accountId: string, record: WardrobeRecord): Promise<void>;
  /** Oublie l'avatar et la garde-robe d'un compte (compte supprimé). */
  forget(accountId: string): Promise<void>;
}

export type WardrobeRecord = { owned: readonly string[]; announced: readonly string[] };
