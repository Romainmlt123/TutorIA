import type { ConsentStatus, Grade } from '@/data/types';

/** Demande de liaison reçue par un parent (élève qui l'a invité ou qui l'a trouvé par e-mail). */
export type LinkRequest = { studentId: string; firstName: string; requestedAt: string };

export type LinkedChild = {
  id: string;
  firstName: string;
  grade: Grade | null;
  under15: boolean;
  consentStatus: ConsentStatus;
  /** Ce parent a donné le consentement : il peut retirer son accord et supprimer le compte. */
  consentGivenByMe: boolean;
};

/** Parent relié, vu par l'élève, avec la date du lien (profil : « Reliée depuis le 2 septembre »). */
export type LinkedParent = { id: string; firstName: string | null; linkedAt: string };

/** Liens entre un parent et ses enfants, vus de l'un ou de l'autre côté. */
export interface FamilyService {
  /** Parent : demandes en attente. */
  linkRequests(): Promise<LinkRequest[]>;
  /**
   * Parent : accepte une demande (et valide le compte d'un enfant de moins de 15 ans).
   * `firstName` finalise le compte d'un parent invité ; `studentId` absent : finalisation seule.
   */
  acceptLinkRequest(studentId: string | null, firstName?: string): Promise<void>;
  declineLinkRequest(studentId: string): Promise<void>;
  /** Parent : enfants reliés. */
  children(): Promise<LinkedChild[]>;
  /** Élève : parents reliés. */
  parents(): Promise<LinkedParent[]>;
  /** Parent : retire le lien avec un enfant. L'élève ne peut pas retirer un parent (v2.8). */
  unlink(otherId: string): Promise<void>;
  /** Parent qui a validé le compte d'un enfant de moins de 15 ans : retrait de l'accord et suppression. */
  deleteChildAccount(studentId: string): Promise<void>;
}
