import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = { known: number; toReview: number; xp: number; onRestart: () => void };

/** Fin de session : carte verte, bilan et XP gagnés. */
export function SessionComplete({ known, toReview, xp, onRestart }: Props) {
  return (
    <GradientSurface
      gradient={theme.subjects['histoire-geo'].gradient}
      shadow={theme.shadow.lg}
      style={styles.card}
      contentStyle={styles.content}>
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
      <Pill
        label={fr.flashcards.xpGained(xp)}
        backgroundColor={theme.onColor.veil}
        color={theme.colors.textOnColor}
        size="lg"
        style={styles.xp}
      />
      <Button
        label={fr.flashcards.restart}
        variant="white"
        weight="bold"
        labelColor={theme.colors.successStrong}
        onPress={onRestart}
        style={styles.restart}
      />
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 540 },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[4],
    padding: theme.space[6],
  },
  check: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  xp: { alignSelf: 'center' },
  restart: { marginTop: theme.space[2], paddingHorizontal: theme.space[6] },
});
