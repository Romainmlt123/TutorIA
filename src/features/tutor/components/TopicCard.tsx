import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { extras, subjectTheme, theme, type SubjectId } from '@/theme';

type Props = {
  /** Absente : discussion libre sur toutes les matières (bleu de l'élève). */
  subjectId?: SubjectId;
  subjectName: string;
  /** Chapitre, ou titre de la discussion libre. */
  chapterTitle: string;
  /** « Leçon 3/5 » à l'écrit, chrono de l'appel au vocal ; rien pour une discussion libre. */
  badge?: { kind: 'lesson'; label: string } | { kind: 'timer'; label: string };
};

/**
 * Carte « Sujet de la discussion », dans le dégradé de la matière comme ses cartes de l'Accueil
 * (écart assumé à la maquette 02a, où elle est blanche).
 */
export function TopicCard({ subjectId, subjectName, chapterTitle, badge }: Props) {
  const subject = subjectId ? subjectTheme(subjectId) : undefined;
  const icon = subject?.icon ?? 'bulle-chat';
  return (
    <View
      accessible
      accessibilityLabel={`${fr.tutor.topicLabel} : ${subjectName}, ${chapterTitle}`}
      style={styles.frame}>
      <GradientSurface
        gradient={subject?.gradient ?? theme.spaces.student.gradient}
        angle={160}
        radius={theme.radius['2xl']}
        shadow={theme.shadow.md}
        contentStyle={styles.card}>
        <Watermark icon={icon} size={72} offset={-14} opacity={extras.watermarkOpacity.subject} />
        <View style={styles.iconVeil}>
          <Icon name={icon} size={22} color={theme.colors.textOnColor} />
        </View>
        <View style={styles.texts}>
          <Text variant="overline" color="textOnColor">
            {subjectName}
          </Text>
          <Text variant="body" weight="bold" color="textOnColor" numberOfLines={1}>
            {chapterTitle}
          </Text>
        </View>
        {badge ? (
          <Pill
            label={badge.label}
            backgroundColor={theme.colors.surface}
            color={subject?.ink ?? theme.spaces.student.ink}
            dotColor={badge.kind === 'timer' ? theme.colors.error : undefined}
            style={styles.pill}
          />
        ) : null}
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'stretch' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  iconVeil: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
  pill: { alignSelf: 'center' },
});
