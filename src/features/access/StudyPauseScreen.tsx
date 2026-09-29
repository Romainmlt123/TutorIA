import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { StudyRules } from '@/services/student';
import type { StudyBlock } from '@/services/student/studyRules';
import { theme } from '@/theme';

import { AccessCard } from './components/AccessCard';

const hour = (time: string) => time.replace(':00', ' h').replace(':', ' h ');

/** Pause décidée avec le parent (P4) : un message bienveillant, jamais une punition. */
export function StudyPauseScreen({ block, rules }: { block: StudyBlock; rules: StudyRules }) {
  const router = useRouter();
  const t = fr.studyPause;
  const body =
    block === 'outside_window'
      ? t.outside_window(hour(rules.allowedFrom), hour(rules.allowedUntil))
      : t[block];
  return (
    <ScreenContainer contentStyle={styles.content}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {t.title}
      </Text>
      <AccessCard
        icon={block === 'evening_pause' ? 'lune' : 'horloge'}
        body={body}
        actionLabel={t.back}
        onAction={() => router.navigate('/')}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
});
