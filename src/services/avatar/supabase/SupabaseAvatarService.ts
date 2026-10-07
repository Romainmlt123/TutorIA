import { normalizeLook, type AvatarLook } from '@/features/avatar/logic/avatarLook';
import { logError } from '@/lib/logger';

import type { AppSupabaseClient } from '../../supabase/client';
import type { AvatarService, WardrobeRecord } from '../AvatarService';
import { DeviceAvatarService } from '../device/DeviceAvatarService';

type AvatarRow = { look: unknown; owned: string[]; announced: string[] };

const union = (a: readonly string[], b: readonly string[]) => [...new Set([...a, ...b])];

/**
 * Avatar enregistré en base (table `avatars`, sous RLS : l'élève seulement), pour le retrouver sur
 * tous ses appareils. L'avatar créé sur l'appareil avant l'étape A4 est repris à la première
 * lecture, puis effacé de l'appareil. Le compte supprimé emporte l'avatar (cascade).
 */
export class SupabaseAvatarService implements AvatarService {
  constructor(
    private readonly supabase: AppSupabaseClient,
    private readonly device: AvatarService = new DeviceAvatarService(),
  ) {}

  private async row(accountId: string): Promise<AvatarRow | null> {
    const { data, error } = await this.supabase
      .from('avatars')
      .select('look, owned, announced')
      .eq('student_id', accountId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  /**
   * Reprend l'avatar et la garde-robe restés sur l'appareil : l'apparence en base l'emporte, les
   * objets s'additionnent. Rend la ligne à jour (null s'il n'y avait rien à reprendre).
   */
  private async adoptDevice(accountId: string, row: AvatarRow | null): Promise<AvatarRow | null> {
    const [look, wardrobe] = await Promise.all([
      this.device.look(accountId),
      this.device.wardrobe(accountId),
    ]);
    if (!look && wardrobe.owned.length === 0 && wardrobe.announced.length === 0) return row;
    const merged: AvatarRow = {
      look: row?.look ?? look,
      owned: union(row?.owned ?? [], wardrobe.owned),
      announced: union(row?.announced ?? [], wardrobe.announced),
    };
    const { error } = await this.supabase.from('avatars').upsert(
      {
        look: merged.look as AvatarLook | null,
        owned: merged.owned,
        announced: merged.announced,
      },
      { onConflict: 'student_id' },
    );
    if (error) throw error;
    // La base fait foi désormais ; un échec ici laisse seulement une copie inutile sur l'appareil.
    await this.device
      .forget(accountId)
      .catch((cause: unknown) => logError('avatar.adopt.forget', cause));
    return merged;
  }

  async look(accountId: string): Promise<AvatarLook | null> {
    let row = await this.row(accountId);
    if (!row?.look) row = await this.adoptDevice(accountId, row);
    return row?.look ? normalizeLook(row.look) : null;
  }

  async saveLook(_accountId: string, look: AvatarLook): Promise<void> {
    // La ligne est celle de l'élève connecté (student_id = auth.uid(), imposé par la base).
    const { error } = await this.supabase
      .from('avatars')
      .upsert({ look }, { onConflict: 'student_id' });
    if (error) throw error;
  }

  async wardrobe(accountId: string): Promise<WardrobeRecord> {
    let row = await this.row(accountId);
    if (!row) row = await this.adoptDevice(accountId, row);
    return { owned: row?.owned ?? [], announced: row?.announced ?? [] };
  }

  async saveWardrobe(_accountId: string, record: WardrobeRecord): Promise<void> {
    const { error } = await this.supabase
      .from('avatars')
      .upsert(
        { owned: [...record.owned], announced: [...record.announced] },
        { onConflict: 'student_id' },
      );
    if (error) throw error;
  }

  /** Le compte supprimé emporte sa ligne en base ; il ne reste qu'à vider l'appareil. */
  async forget(accountId: string): Promise<void> {
    await this.device.forget(accountId);
  }
}
