import { config } from '@/lib/config';

import { getSupabase } from '../supabase/client';
import type { AvatarService } from './AvatarService';
import { DeviceAvatarService } from './device/DeviceAvatarService';
import { SupabaseAvatarService } from './supabase/SupabaseAvatarService';

export type { AvatarService } from './AvatarService';

/** Avatar en base avec Supabase ; sur l'appareil en mode simulé (comptes de démonstration). */
export const avatarService: AvatarService =
  config.backend === 'supabase'
    ? new SupabaseAvatarService(getSupabase())
    : new DeviceAvatarService();
