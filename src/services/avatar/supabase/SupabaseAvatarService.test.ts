import { DEFAULT_LOOK, type AvatarLook } from '@/features/avatar/logic/avatarLook';

import type { AppSupabaseClient } from '../../supabase/client';
import type { AvatarService, WardrobeRecord } from '../AvatarService';
import { SupabaseAvatarService } from './SupabaseAvatarService';

type Row = { look: unknown; owned: string[]; announced: string[] };

/** Faux client Supabase : une ligne `avatars` en mémoire, et les upserts reçus. */
function fakeSupabase(initial: Row | null) {
  let row = initial;
  const upserts: Record<string, unknown>[] = [];
  const client = {
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: row, error: null }) }),
      }),
      upsert: async (values: Partial<Row>) => {
        upserts.push(values);
        row = { look: null, owned: [], announced: [], ...row, ...values };
        return { error: null };
      },
    }),
  } as unknown as AppSupabaseClient;
  return { client, upserts, current: () => row };
}

/** Faux avatar sur l'appareil (celui d'avant l'étape A4). */
function fakeDevice(look: AvatarLook | null, wardrobe: WardrobeRecord) {
  const forget = jest.fn(async () => undefined);
  const device: AvatarService = {
    look: async () => look,
    saveLook: async () => undefined,
    wardrobe: async () => wardrobe,
    saveWardrobe: async () => undefined,
    forget,
  };
  return { device, forget };
}

const NOTHING: WardrobeRecord = { owned: [], announced: [] };
const deviceLook: AvatarLook = { ...DEFAULT_LOOK, skin: 5, size: 0.8 };

describe('avatar en base (Supabase)', () => {
  it('lit l’apparence et la garde-robe enregistrées, sans toucher à l’appareil', async () => {
    const db = fakeSupabase({ look: DEFAULT_LOOK, owned: ['bandana'], announced: ['bandana'] });
    const { device, forget } = fakeDevice(deviceLook, NOTHING);
    const service = new SupabaseAvatarService(db.client, device);
    expect(await service.look('lea')).toEqual(DEFAULT_LOOK);
    expect(await service.wardrobe('lea')).toEqual({ owned: ['bandana'], announced: ['bandana'] });
    expect(db.upserts).toHaveLength(0);
    expect(forget).not.toHaveBeenCalled();
  });

  it('reprend l’avatar resté sur le téléphone, puis l’efface de l’appareil', async () => {
    const db = fakeSupabase(null);
    const { device, forget } = fakeDevice(deviceLook, { owned: ['casquette'], announced: [] });
    const service = new SupabaseAvatarService(db.client, device);
    expect(await service.look('lea')).toEqual(deviceLook);
    expect(db.current()).toEqual({ look: deviceLook, owned: ['casquette'], announced: [] });
    expect(forget).toHaveBeenCalledWith('lea');
  });

  it('garde l’apparence de la base et additionne les objets de l’appareil', async () => {
    const db = fakeSupabase({ look: null, owned: ['bandana'], announced: ['bandana'] });
    const { device } = fakeDevice(deviceLook, { owned: ['casquette', 'bandana'], announced: [] });
    const service = new SupabaseAvatarService(db.client, device);
    await service.look('lea');
    expect(db.current()).toEqual({
      look: deviceLook,
      owned: ['bandana', 'casquette'],
      announced: ['bandana'],
    });
  });

  it('n’écrit rien quand l’appareil n’a rien à reprendre', async () => {
    const db = fakeSupabase(null);
    const { device, forget } = fakeDevice(null, NOTHING);
    const service = new SupabaseAvatarService(db.client, device);
    expect(await service.look('lea')).toBeNull();
    expect(await service.wardrobe('lea')).toEqual(NOTHING);
    expect(db.upserts).toHaveLength(0);
    expect(forget).not.toHaveBeenCalled();
  });

  it('enregistre l’apparence et la garde-robe sur la ligne de l’élève connecté', async () => {
    const db = fakeSupabase(null);
    const service = new SupabaseAvatarService(db.client, fakeDevice(null, NOTHING).device);
    await service.saveLook('lea', deviceLook);
    await service.saveWardrobe('lea', { owned: ['bonnet'], announced: [] });
    expect(db.upserts).toEqual([{ look: deviceLook }, { owned: ['bonnet'], announced: [] }]);
  });
});
