import type { AvatarLook } from '@/features/avatar/logic/avatarLook';

/**
 * Avatar de l'élève connecté : l'apparence de sa figurine. Elle ne contient aucune donnée
 * personnelle (des rangs dans les palettes et des noms de formes, jamais de photo).
 */
export interface AvatarService {
  /** Apparence enregistrée, ou null si l'élève n'a pas encore créé son avatar. */
  look(accountId: string): Promise<AvatarLook | null>;
  saveLook(accountId: string, look: AvatarLook): Promise<void>;
  /** Oublie l'avatar d'un compte (compte supprimé). */
  forget(accountId: string): Promise<void>;
}
