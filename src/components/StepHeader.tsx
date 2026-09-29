import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { theme, type SpaceTone } from '@/theme';

import { IconButton } from './IconButton';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

type Props = {
  step: number;
  total: number;
  /** Absent à la première étape de l'onboarding : rien avant (la place reste libre). */
  onBack?: () => void;
  /** « Passer » (onboarding) : absent pour l'inscription du parent. */
  onSkip?: () => void;
  tone?: SpaceTone;
  /**
   * `inline` : retour, étape et « Passer » sur une ligne (O1 à O4).
   * `stacked` : retour seul, puis l'étape et sa barre sur toute la largeur (L4, L5).
   */
  layout?: 'inline' | 'stacked';
};

/** En-tête d'étape : retour, « Étape n sur N », barre segmentée de 8 px et « Passer ». */
export function StepHeader({
  step,
  total,
  onBack,
  onSkip,
  tone = 'student',
  layout = 'inline',
}: Props) {
  const space = theme.spaces[tone];
  const progress = (
    <View style={layout === 'stacked' ? styles.progressStacked : styles.progress}>
      <Text
        variant="overline"
        color={space.ink}
        accessibilityLabel={fr.form.stepOf(step, total)}
        accessibilityRole="header">
        {fr.form.stepOf(step, total)}
      </Text>
      <View style={styles.bars} accessibilityElementsHidden importantForAccessibility="no">
        {Array.from({ length: total }, (_, index) => (
          <View
            key={index}
            style={[styles.bar, { backgroundColor: index < step ? space.primary : space.track }]}
          />
        ))}
      </View>
    </View>
  );
  const back = onBack ? (
    <IconButton
      icon="chevron-gauche"
      iconSize={22}
      accessibilityLabel={fr.form.back}
      onPress={onBack}
    />
  ) : (
    <View style={styles.backSpace} />
  );

  if (layout === 'stacked') {
    return (
      <View style={styles.stacked}>
        <View style={styles.row}>{back}</View>
        {progress}
      </View>
    );
  }
  return (
    <View style={styles.row}>
      {back}
      {progress}
      {onSkip ? (
        <PressableBase
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel={fr.form.skipLabel}
          style={styles.skip}>
          <Text variant="label" weight="bold" color="textSecondary">
            {fr.form.skip}
          </Text>
        </PressableBase>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  stacked: { gap: theme.space[6] },
  progress: { flex: 1, gap: 6 },
  progressStacked: { gap: theme.space[2] },
  bars: { flexDirection: 'row', gap: 6 },
  bar: { flex: 1, height: theme.space[2], borderRadius: theme.radius.full },
  backSpace: { width: theme.space[12], height: theme.space[12] },
  skip: {
    height: theme.space[12],
    paddingHorizontal: theme.space[1],
    justifyContent: 'center',
    flexShrink: 0,
  },
});
