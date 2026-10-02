import { Redirect } from 'expo-router';

import { AvatarLabScreen } from '@/features/avatar/dev/AvatarLabScreen';

/** Laboratoire des avatars (développement seulement). */
export default function AvatarLab() {
  if (!__DEV__) return <Redirect href="/" />;
  return <AvatarLabScreen />;
}
