import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { extras, subjectTheme, theme, type SubjectId } from '@/theme';

import { GradientSurface } from '../GradientSurface';
import { Icon } from '../Icon';
import { Pill } from '../Pill';
import { PressableBase } from '../PressableBase';
import { ProgressBar } from '../ProgressBar';
import { Text } from '../Text';
import { Watermark } from '../Watermark';

type ProgressMode = { mode: 'progress'; mastery: number };
type SelectMode = { mode: 'select'; cardCount: number; selected: boolean };

export type SubjectCardProps = (ProgressMode | SelectMode) & {
  subjectId: SubjectId;
  name: string;
  onPress: () => void;
};

/** Carte de matière colorée (Accueil : maîtrise ; Flashcards : sélection et nombre de cartes). */
export function SubjectCard(props: SubjectCardProps) {
  const { subjectId, name, onPress } = props;
  const subject = subjectTheme(subjectId);
  const selected = props.mode === 'select' && props.selected;
  const percent = props.mode === 'progress' ? Math.round(props.mastery * 100) : 0;
  const label =
    props.mode === 'progress'
      ? fr.home.subjectCardLabel(name, percent)
      : `${name}, ${fr.common.cards(props.cardCount)}`;

  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-selected={props.mode === 'select' ? selected : undefined}
      shadow={selected ? extras.selectionRing(subject.ink) : theme.shadow.sm}
      style={[styles.card, { minHeight: props.mode === 'progress' ? 132 : 128 }]}>
      <GradientSurface
        gradient={subject.gradient}
        radius={theme.radius['2xl']}
        style={styles.fill}
        contentStyle={styles.content}>
        <Watermark icon={subject.icon} opacity={extras.watermarkOpacity.subject} />
        <View style={styles.top}>
          <View style={styles.iconVeil}>
            <Icon name={subject.icon} size={22} color={theme.colors.textOnColor} />
          </View>
          {props.mode === 'progress' ? (
            <Pill
              label={`${percent} %`}
              backgroundColor={theme.onColor.veil}
              color={theme.colors.textOnColor}
            />
          ) : null}
        </View>
        {props.mode === 'progress' ? (
          <View style={styles.bottomProgress}>
            <Text variant="bodyLg" weight="black" color="textOnColor" numberOfLines={2}>
              {name}
            </Text>
            <ProgressBar
              value={props.mastery}
              height={6}
              trackColor={theme.onColor.track}
              fill={theme.colors.textOnColor}
            />
          </View>
        ) : (
          <View>
            <Text variant="bodyLg" weight="black" color="textOnColor" numberOfLines={2}>
              {name}
            </Text>
            <Text variant="caption" color="textOnColor">
              {fr.common.cards(props.cardCount)}
            </Text>
          </View>
        )}
        {selected ? (
          <View style={styles.check}>
            <Icon name="coche" size={16} color={subject.ink} strokeWidth={2.5} />
          </View>
        ) : null}
      </GradientSurface>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  // Rangée dans une carte de section (v2.5) : coins de 16 px et ombre légère.
  card: { flex: 1, borderRadius: theme.radius['2xl'] },
  fill: { flex: 1 },
  content: { padding: theme.space[4], gap: theme.space[3], justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconVeil: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomProgress: { gap: theme.space[2] },
  check: {
    position: 'absolute',
    top: theme.space[4],
    right: theme.space[4],
    width: 28,
    height: 28,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
