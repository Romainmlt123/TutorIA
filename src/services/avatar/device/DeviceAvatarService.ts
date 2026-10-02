import AsyncStorage from '@react-native-async-storage/async-storage';

import { normalizeLook, type AvatarLook } from '@/features/avatar/logic/avatarLook';
import { logError } from '@/lib/logger';

import type { AvatarService } from '../AvatarService';

/** Un enregistrement par compte : deux élèves sur le même téléphone ont chacun leur avatar. */
const keyOf = (accountId: string) => `avatar.look.v1.${accountId}`;

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

  async forget(accountId: string): Promise<void> {
    await AsyncStorage.removeItem(keyOf(accountId));
  }
}
