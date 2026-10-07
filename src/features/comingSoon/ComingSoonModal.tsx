import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import type { IconName } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { ComingSoon } from './ComingSoon';

const TOPICS: Record<string, { title: string; icon: IconName; body?: string }> = {
  notifications: { title: fr.comingSoon.topics.notifications, icon: 'cloche' },
  profil: { title: fr.comingSoon.topics.profil, icon: 'etoile' },
  reglages: { title: fr.comingSoon.topics.reglages, icon: 'reglages' },
  // Sujets communs aux deux espaces : texte sans tutoiement ni vouvoiement.
  comptes: {
    title: fr.comingSoon.topics.comptes,
    icon: 'cadenas',
    body: fr.comingSoon.neutralBody,
  },
  conditions: {
    title: fr.comingSoon.topics.conditions,
    icon: 'bouclier',
    body: fr.comingSoon.neutralBody,
  },
  carte: { title: fr.comingSoon.topics.carte, icon: 'boussole' },
  abonnement: {
    title: fr.comingSoon.topics.abonnement,
    icon: 'etoile',
    body: fr.comingSoon.neutralBody,
  },
};

/** Fenêtre « Bientôt disponible » (notifications, réglages, Apple et Google, conditions…). */
export function ComingSoonModal() {
  const router = useRouter();
  const { sujet } = useLocalSearchParams<{ sujet?: string }>();
  const topic = TOPICS[sujet ?? ''] ?? { title: fr.common.comingSoon, icon: 'etoile' as const };
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {topic.title}
      </Text>
      <ComingSoon
        icon={topic.icon}
        body={topic.body ?? fr.comingSoon.body}
        actionLabel={fr.comingSoon.close}
        onAction={close}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
});
