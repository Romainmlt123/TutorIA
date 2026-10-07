import { Redirect } from 'expo-router';

import { AtelierScreen } from '@/features/explorer/dev/AtelierScreen';

/** Atelier des illustrations d'Explorer (développement seulement). */
export default function ExplorerAtelier() {
  if (!__DEV__) return <Redirect href="/" />;
  return <AtelierScreen />;
}
