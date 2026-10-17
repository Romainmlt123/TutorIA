import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BrandMessage } from '@/components/BrandMessage';
import { Button } from '@/components/Button';
import type { IconName } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { formatHour } from '@/lib/format';
import { useStudentOverview } from '@/lib/session/useStudentOverview';
import type { StudyRules } from '@/services/student';
import type { StudyBlock } from '@/services/student/studyRules';
import { extras, theme } from '@/theme';

import { DailyWinCard } from './components/DailyWinCard';

const t = fr.studyPause;
const { palette } = theme;

/** Badge du logo : lune (soir), horloge (plage horaire), trophée (temps du jour). */
const BADGES: Record<StudyBlock, { icon: IconName; color: string }> = {
  evening_pause: { icon: 'lune', color: palette.violet[600] },
  outside_window: { icon: 'horloge', color: palette.orange[700] },
  daily_limit: { icon: 'trophee', color: palette.green[800] },
};

type Props = {
  block: StudyBlock;
  rules: StudyRules;
  /** Dans l'onglet Tutor'IA, la barre de navigation reste ; la session de flashcards est plein écran. */
  withNav?: boolean;
};

/**
 * R1 à R3 · La pause décidée avec les parents (P4), v2.15 : un message bienveillant, jamais une
 * punition, sur le fond de marque. Le temps du jour atteint félicite d'abord.
 */
export function StudyPauseScreen({ block, rules, withNav = true }: Props) {
  const router = useRouter();
  const { streakDays } = useStudentOverview();
  const from = formatHour(rules.allowedFrom);
  const until = formatHour(rules.allowedUntil);
  const title = block === 'outside_window' ? t.outside_window.title(from) : t[block].title;
  const body = block === 'outside_window' ? t.outside_window.body(from, until) : t[block].body;

  return (
    <BrandMessage badge={BADGES[block]} title={title} body={body} withNav={withNav}>
      {block === 'daily_limit' ? (
        <DailyWinCard todaySeconds={rules.todaySeconds} streakDays={streakDays} />
      ) : null}
      <View style={[styles.buttons, block !== 'daily_limit' && styles.single]}>
        <Button
          label={t.back}
          variant="white"
          size="lg"
          leadingIcon="accueil"
          labelColor={theme.colors.primaryHover}
          shadow={extras.studyPause.buttonShadow}
          onPress={() => router.navigate('/')}
          style={styles.home}
        />
        {block === 'daily_limit' ? (
          <Button
            label={t.progress}
            variant="glass"
            size="lg"
            leadingIcon="graphique"
            onPress={() => router.navigate('/stats')}
          />
        ) : null}
      </View>
    </BrandMessage>
  );
}

const styles = StyleSheet.create({
  buttons: { gap: theme.space[3] },
  // R1 et R2 : le bouton est à 32 px du texte (24 px pour la carte verte de R3).
  single: { marginTop: theme.space[2] },
  home: { height: 56, borderRadius: 18 },
});
