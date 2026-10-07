import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeLook, type AvatarLook } from '@/features/avatar/logic/avatarLook';
import { logError } from '@/lib/logger';

import type { AvatarService, WardrobeRecord } from '../AvatarService';

/** Un enregistrement par compte : deux élèves sur le même téléphone ont chacun leur avatar. */
const keyOf = (accountId: string) => `avatar.look.v1.${accountId}`;
const wardrobeKeyOf = (accountId: string) => `avatar.wardrobe.v1.${accountId}`;

const EMPTY: WardrobeRecord = { owned: [], announced: [] };

/** Liste d'identifiants lue d'un enregistrement : tout ce qui n'est pas du texte est ignoré. */
const ids = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/** Avatar enregistré sur l'appareil. */
export class DeviceAvatarService implements AvatarService {
  async look(accountId: string): Promise<AvatarLook | null> {
    try {
      const raw = await AsyncStorage.getItem(keyOf(accountId));
      return raw === null ? null : normalizeLook(JSON.parse(raw));
    } catch (error) {
      // Stockage illisible ou enregistrement abîmé : l'élève retrouve l'éditeur comme s'il
      // n'avait pas encore d'avatar, plutôt qu'une erreur.
      logError('avatar.read', error);
      return null;
    }
  }

  async saveLook(accountId: string, look: AvatarLook): Promise<void> {
    await AsyncStorage.setItem(keyOf(accountId), JSON.stringify(look));
  }

  async wardrobe(accountId: string): Promise<WardrobeRecord> {
    try {
      const raw = await AsyncStorage.getItem(wardrobeKeyOf(accountId));
      if (raw === null) return EMPTY;
      const value: unknown = JSON.parse(raw);
      const record =
        typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
      return { owned: ids(record.owned), announced: ids(record.announced) };
    } catch (error) {
      // Illisible : les objets se recalculent d'après la progression ; seuls les anciens objets
      // d'une série retombée seraient à regagner.
      logError('avatar.wardrobe.read', error);
      return EMPTY;
    }
  }

  async saveWardrobe(accountId: string, record: WardrobeRecord): Promise<void> {
    await AsyncStorage.setItem(wardrobeKeyOf(accountId), JSON.stringify(record));
  }

  async forget(accountId: string): Promise<void> {
    await AsyncStorage.multiRemove([keyOf(accountId), wardrobeKeyOf(accountId)]);
  }
}
