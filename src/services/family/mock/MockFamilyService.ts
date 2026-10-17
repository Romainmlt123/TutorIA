import { AuthError, type AuthService, type StudentAccount } from '../../auth/AuthService';
import { PERSONAS } from '../../auth/mock/MockAuthService';
import type { Grade } from '@/data/types';

import type { FamilyService, LinkedChild, LinkedParent, LinkRequest } from '../FamilyService';

type Link = { parentId: string; studentId: string; linkedAt: string };

const lea = PERSONAS.lea as StudentAccount;

/** Liens simulés, en mémoire : Claire est reliée à Léa et a validé son compte. */
export class MockFamilyService implements FamilyService {
  private links: Link[] = [
    { parentId: PERSONAS.claire.id, studentId: lea.id, linkedAt: '2026-09-02T08:00:00.000Z' },
  ];
  private requests: (LinkRequest & { parentId: string })[] = [];
  /** Prénom et classe modifiés par le parent (F5), par-dessus la persona. */
  private edits = new Map<string, { firstName: string; grade: Grade }>();

  constructor(private readonly auth: AuthService) {}

  /** Relie ou délie Claire et Léa depuis `/dev/catalogue`, pour voir l'espace Parents sans enfant (J3). */
  setDemoLink(on: boolean): void {
    const isDemo = (link: Link) =>
      link.parentId === PERSONAS.claire.id && link.studentId === lea.id;
    this.links = this.links.filter((link) => !isDemo(link));
    if (on) {
      this.links.push({
        parentId: PERSONAS.claire.id,
        studentId: lea.id,
        linkedAt: '2026-09-02T08:00:00.000Z',
      });
    }
  }

  private me() {
    const session = this.auth.getSession();
    if (session.status !== 'signedIn') throw new AuthError('unauthorized');
    return session.account;
  }

  async linkRequests(): Promise<LinkRequest[]> {
    const me = this.me();
    return this.requests.filter((request) => request.parentId === me.id);
  }

  async acceptLinkRequest(studentId: string | null): Promise<void> {
    const me = this.me();
    if (studentId) {
      this.requests = this.requests.filter((request) => request.studentId !== studentId);
      this.links.push({ parentId: me.id, studentId, linkedAt: new Date().toISOString() });
    }
    await this.auth.refreshAccount();
  }

  async declineLinkRequest(studentId: string): Promise<void> {
    this.requests = this.requests.filter((request) => request.studentId !== studentId);
  }

  async children(): Promise<LinkedChild[]> {
    const me = this.me();
    return this.links
      .filter((link) => link.parentId === me.id && link.studentId === lea.id)
      .map(() => ({
        id: lea.id,
        firstName: this.edits.get(lea.id)?.firstName ?? lea.firstName,
        grade: this.edits.get(lea.id)?.grade ?? lea.grade,
        under15: lea.under15,
        consentStatus: lea.consentStatus,
        consentGivenByMe: true,
      }));
  }

  async parents(): Promise<LinkedParent[]> {
    const me = this.me();
    return this.links
      .filter((link) => link.studentId === me.id)
      .map((link) => ({
        id: link.parentId,
        firstName: link.parentId === PERSONAS.claire.id ? PERSONAS.claire.firstName : null,
        linkedAt: link.linkedAt,
      }));
  }

  /** Comme en base : seul le parent retire un lien (v2.8). */
  async unlink(otherId: string): Promise<void> {
    const me = this.me();
    this.links = this.links.filter(
      (link) => !(link.parentId === me.id && link.studentId === otherId),
    );
  }

  async deleteChildAccount(studentId: string): Promise<void> {
    this.links = this.links.filter((link) => link.studentId !== studentId);
  }

  async updateChild(studentId: string, firstName: string, grade: Grade): Promise<void> {
    this.edits.set(studentId, { firstName: firstName.trim(), grade });
  }

  /** Semaine simulée : 4 h 40 pour Léa, comme les données de démonstration de P1. */
  async weekSeconds(studentIds: readonly string[]): Promise<Record<string, number>> {
    return Object.fromEntries(studentIds.map((id) => [id, id === lea.id ? 4 * 3600 + 40 * 60 : 0]));
  }
}
