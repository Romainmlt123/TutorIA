import { callAccountApi } from '../../auth/accountApi';
import type { AcceptLinkRequestBody, DeleteChildBody } from '../../auth/api-contract';
import type { AuthService } from '../../auth/AuthService';
import type { AppSupabaseClient } from '../../supabase/client';
import type { FamilyService, LinkedChild, LinkedParent, LinkRequest } from '../FamilyService';

/** Liens parent-enfant sur Supabase : lectures sous RLS, acceptation et suppression par le serveur. */
export class SupabaseFamilyService implements FamilyService {
  constructor(
    private readonly supabase: AppSupabaseClient,
    private readonly auth: AuthService,
  ) {}

  private async userId(): Promise<string> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error || !data.user) throw error ?? new Error('Aucune session');
    return data.user.id;
  }

  private async firstNames(ids: readonly string[]): Promise<Map<string, string | null>> {
    if (ids.length === 0) return new Map();
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, first_name')
      .in('id', ids);
    if (error) throw error;
    return new Map(data.map((profile) => [profile.id, profile.first_name]));
  }

  async linkRequests(): Promise<LinkRequest[]> {
    const parentId = await this.userId();
    const { data, error } = await this.supabase
      .from('link_requests')
      .select('student_id, created_at')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const names = await this.firstNames(data.map((request) => request.student_id));
    return data.map((request) => ({
      studentId: request.student_id,
      firstName: names.get(request.student_id) ?? '',
      requestedAt: request.created_at,
    }));
  }

  async acceptLinkRequest(studentId: string | null, firstName?: string): Promise<void> {
    const body: AcceptLinkRequestBody = { studentId: studentId ?? undefined, firstName };
    await callAccountApi('/api/link-requests/accept', await this.auth.getAccessToken(), { body });
    await this.auth.refreshAccount();
  }

  async declineLinkRequest(studentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('link_requests')
      .delete()
      .eq('student_id', studentId);
    if (error) throw error;
  }

  async children(): Promise<LinkedChild[]> {
    const parentId = await this.userId();
    const [students, consents] = await Promise.all([
      this.supabase
        .from('students')
        .select('id, grade, under_15, consent_status, created_at')
        .neq('id', parentId)
        .order('created_at'),
      this.supabase.from('parental_consents').select('student_id').eq('parent_id', parentId),
    ]);
    if (students.error) throw students.error;
    if (consents.error) throw consents.error;
    const names = await this.firstNames(students.data.map((student) => student.id));
    const consented = new Set(consents.data.map((consent) => consent.student_id));
    return students.data.map((student) => ({
      id: student.id,
      firstName: names.get(student.id) ?? '',
      grade: student.grade,
      under15: student.under_15,
      consentStatus: student.consent_status,
      consentGivenByMe: consented.has(student.id),
    }));
  }

  async parents(): Promise<LinkedParent[]> {
    const studentId = await this.userId();
    const { data, error } = await this.supabase
      .from('parent_links')
      .select('parent_id')
      .eq('student_id', studentId);
    if (error) throw error;
    const names = await this.firstNames(data.map((link) => link.parent_id));
    return data.map((link) => ({
      id: link.parent_id,
      firstName: names.get(link.parent_id) ?? null,
    }));
  }

  async unlink(otherId: string): Promise<void> {
    const me = await this.userId();
    const { error } = await this.supabase
      .from('parent_links')
      .delete()
      .or(
        `and(parent_id.eq.${me},student_id.eq.${otherId}),and(student_id.eq.${me},parent_id.eq.${otherId})`,
      );
    if (error) throw error;
  }

  async deleteChildAccount(studentId: string): Promise<void> {
    const body: DeleteChildBody = { studentId };
    await callAccountApi('/api/account/delete-child', await this.auth.getAccessToken(), { body });
  }
}
