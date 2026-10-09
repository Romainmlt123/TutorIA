import { useRouter } from 'expo-router';

import { WoodDialog } from '@/components/game/WoodDialog';
import { fr } from '@/i18n/fr';

import { useAvatarLook } from '../hooks/useAvatarLook';
import { useWardrobe } from '../hooks/useWardrobe';

const t = fr.avatar;

/**
 * « Nouveau ! » : les objets que l'élève vient de gagner, annoncés une fois sur un panneau de bois,
 * avec « Essayer » (l'éditeur ouvert sur la tenue). Seulement s'il a déjà créé son avatar : sinon,
 * c'est l'éditeur qui lui est proposé d'abord.
 */
export function WardrobeNews({ visible }: { visible: boolean }) {
  const router = useRouter();
  const saved = useAvatarLook();
  const { fresh, markAnnounced } = useWardrobe();
  const labels: Readonly<Record<string, string>> = t.items;
  const show = visible && saved.data != null && fresh.length > 0;
  return (
    <WoodDialog
      visible={show}
      title={t.newTitle}
      body={t.newBody(fresh.map((item) => labels[item.id] ?? item.id))}
      primaryLabel={t.tryOn}
      onPrimary={() => {
        markAnnounced();
        router.push({ pathname: '/avatar', params: { onglet: 'tenue' } });
      }}
      secondaryLabel={t.later}
      onSecondary={markAnnounced}
    />
  );
}
