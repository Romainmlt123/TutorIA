import { StyleSheet, View } from 'react-native';

import { subjectTheme, theme, type SubjectId } from '@/theme';

import { GradientSurface } from '../GradientSurface';
import { Icon } from '../Icon';

type Props = {
  /** Sans matière (discussion libre « Toutes les matières ») : tuile bleue de l'élève, bulle. */
  subjectId?: SubjectId;
  /** 48 (Reprendre), 40 (Sujet de la discussion), 36 (pastilles de la révision du jour). */
  size: 36 | 40 | 48;
};

const SHAPES = {
  48: { radius: theme.radius['2xl'], icon: 24, stroke: 1.75 },
  40: { radius: 12, icon: 22, stroke: 1.75 },
  36: { radius: theme.radius.full, icon: 16, stroke: 2 },
} as const;

/** Tuile de matière en dégradé avec son icône blanche. */
export function SubjectTile({ subjectId, size }: Props) {
  const subject = subjectId ? subjectTheme(subjectId) : undefined;
  const shape = SHAPES[size];
  const tile = (
    <GradientSurface
      gradient={subject?.tile ?? theme.spaces.student.gradient}
      radius={shape.radius}
      style={{ width: size, height: size }}
      contentStyle={styles.center}>
      <Icon
        name={subject?.icon ?? 'bulle-chat'}
        size={shape.icon}
        color={theme.colors.textOnColor}
        strokeWidth={shape.stroke}
      />
    </GradientSurface>
  );
  if (size !== 36) return tile;
  // Pastille chevauchante : bord blanc de 2 px.
  return <View style={styles.ring}>{tile}</View>;
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.colors.surface,
    width: 36,
    height: 36,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
