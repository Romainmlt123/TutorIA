import { AuthError, type AuthService, type StudentAccount } from '../../auth/AuthService';
import { PERSONAS } from '../../auth/mock/MockAuthService';
import type { FamilyService, LinkedChild, LinkedParent, LinkRequest } from '../FamilyService';

type Link = { parentId: string; studentId: string };

const lea = PERSONAS.lea as StudentAccount;

/** Liens simulés, en mémoire : Claire est reliée à Léa et a validé son compte. */
export class MockFamilyService implements FamilyService {
  private links: Link[] = [{ parentId: PERSONAS.claire.id, studentId: lea.id }];
  private requests: (LinkRequest & { parentId: string })[] = [];

  constructor(private readonly auth: AuthService) {}

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
      this.links.push({ parentId: me.id, studentId });
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
        firstName: lea.firstName,
        grade: lea.grade,
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
      }));
  }

  async unlink(otherId: string): Promise<void> {
    const me = this.me();
    this.links = this.links.filter(
      (link) =>
        !(link.parentId === me.id && link.studentId === otherId) &&
        !(link.studentId === me.id && link.parentId === otherId),
    );
  }

  async deleteChildAccount(studentId: string): Promise<void> {
    this.links = this.links.filter((link) => link.studentId !== studentId);
  }
}
