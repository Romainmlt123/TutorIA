import type { AvatarService } from './AvatarService';
import { DeviceAvatarService } from './device/DeviceAvatarService';

export type { AvatarService } from './AvatarService';

/**
 * L'avatar est enregistré sur l'appareil, quel que soit le backend : la version Supabase arrive
 * avec l'étape A4 de la feuille de route (ROADMAP.md), sans changer cette interface.
 */
export const avatarService: AvatarService = new DeviceAvatarService();
