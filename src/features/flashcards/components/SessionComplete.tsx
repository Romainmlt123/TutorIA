import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = {
  known: number;
  toReview: number;
  xp: number;
  sessionsDone: number;
  sessionsTarget: number;
  onRestart: () => void;
  onOtherChapter: () => void;
};

/**
 * 3C · Fin de session (v2.12) : dégradé violet → bleu de la marque, étoile en filigrane, bilan,
 * compteurs, XP gagnés et objectif du jour, puis « Recommencer » et « Choisir un autre chapitre ».
 */
export function SessionComplete({
  known,
  toReview,
  xp,
  sessionsDone,
  sessionsTarget,
  onRestart,
  onOtherChapter,
}: Props) {
  return (
    <GradientSurface
      gradient={theme.goal.gradient}
      angle={160}
      shadow={theme.shadow.lg}
      style={styles.card}
      contentStyle={styles.content}>
      <Watermark icon="etoile" size={180} offset={-40} opacity={0.12} />
      <View style={styles.check}>
        <Icon name="coche" size={36} color={theme.colors.textOnColor} strokeWidth={2.25} />
      </View>
      <Text
        variant="h2"
        weight="black"
        color="textOnColor"
        align="center"
        accessibilityRole="header">
        {fr.flashcards.completeTitle}
      </Text>
      <Text variant="body" weight="medium" color="textOnColor" align="center">
        {fr.flashcards.completeSummary(known, toReview)}
      </Text>
      <View style={styles.tally}>
        <Pill
          label={fr.flashcards.known(known)}
          backgroundColor={theme.colors.surface}
          color={theme.colors.successStrong}
        />
        <Pill
          label={fr.flashcards.toReview(toReview)}
          backgroundColor={theme.colors.surface}
          color={theme.colors.warningStrong}
        />
      </View>
      <View style={styles.xp}>
        <Icon name="etoile" size={18} color={theme.colors.textOnColor} />
        <Text variant="body" weight="bold" color="textOnColor">
          {fr.flashcards.xpGained(xp)}
        </Text>
      </View>
      <View style={styles.goal}>
        <Icon name="cible" size={18} color={theme.colors.textOnColor} />
        <Text variant="label" weight="bold" color="textOnColor">
          {fr.flashcards.dailyGoal(sessionsDone, sessionsTarget)}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label={fr.flashcards.restart}
          variant="white"
          size="lg"
          labelColor={theme.palette.violet[600]}
          onPress={onRestart}
        />
        <Button
          label={fr.flashcards.otherChapter}
          variant="glass"
          size="lg"
          onPress={onOtherChapter}
        />
      </View>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 540 },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[4],
    paddingVertical: theme.space[8],
    paddingHorizontal: theme.space[6],
  },
  check: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tally: { flexDirection: 'row', gap: theme.space[2] },
  xp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: 36,
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
  },
  goal: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  actions: { alignSelf: 'stretch', gap: 10, marginTop: theme.space[2] },
});
