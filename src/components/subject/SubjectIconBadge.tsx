import { StyleSheet, View } from 'react-native';

import { subjectTheme, theme, type SubjectId } from '@/theme';

import { Icon } from '../Icon';

type Props = {
  subjectId: SubjectId;
  /** 36 : carré arrondi (Stats) ; 48 : rond (carte de flashcard). */
  size: 36 | 48;
};

/** Icône de la matière sur son fond doux. */
export function SubjectIconBadge({ subjectId, size }: Props) {
  const subject = subjectTheme(subjectId);
  const round = size === 48;
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: round ? theme.radius.full : 12,
          backgroundColor: subject.soft,
        },
      ]}>
      <Icon
        name={subject.icon}
        size={round ? 24 : 20}
        color={round ? subject.ink : subject.bar}
        strokeWidth={round ? 1.75 : 2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
