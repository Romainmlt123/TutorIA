import { StyleSheet, View } from 'react-native';

import { GRADE_GROUPS, GRADES } from '@/data/grades';
import type { Grade } from '@/data/types';
import { fr } from '@/i18n/fr';
import { extras, theme, type SpaceTone } from '@/theme';

import { GradientSurface } from './GradientSurface';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

type Props = {
  value: Grade | null;
  onChange: (grade: Grade) => void;
  tone?: SpaceTone;
  /**
   * `grouped` : Primaire, Collège, Lycée (O1). `grid` : 4 colonnes violettes (L5).
   * `columns` : les mêmes groupes sur 5 colonnes, cases sur le fond `bg` (F1, F5).
   */
  layout?: Layout;
};

type Layout = 'grouped' | 'grid' | 'columns';

type ChipProps = {
  grade: Grade;
  selected: boolean;
  onPress: () => void;
  tone: SpaceTone;
  layout: Layout;
};

function GradeChip({ grade, selected, onPress, tone, layout }: ChipProps) {
  const space = theme.spaces[tone];
  // Les cases pleines (sans dégradé) : la grille de L5 et les colonnes de F1.
  const grid = layout !== 'grouped';
  const columns = layout === 'columns';
  const label = (
    <Text
      variant={grid && !columns ? 'lead' : 'body'}
      weight="bold"
      color={selected ? 'textOnColor' : 'text'}
      maxFontSizeMultiplier={1.3}>
      {grade}
    </Text>
  );
  return (
    <PressableBase
      onPress={onPress}
      role="radio"
      aria-checked={selected}
      accessibilityLabel={grade}
      shadow={
        selected
          ? grid
            ? extras.parentChipShadow
            : space.shadow
          : columns
            ? undefined
            : theme.shadow.sm
      }
      style={[
        grid ? styles.gridChip : styles.chip,
        columns && styles.columnChip,
        !selected && (columns ? styles.idleFilled : styles.idle),
      ]}>
      {selected && !grid ? (
        <GradientSurface
          gradient={space.gradient}
          radius={theme.radius['2xl']}
          style={StyleSheet.absoluteFill}
          contentStyle={styles.center}>
          {label}
        </GradientSurface>
      ) : (
        <View style={[styles.center, selected && { backgroundColor: space.primary }]}>{label}</View>
      )}
    </PressableBase>
  );
}

/** Choix de la classe, du CP à la Terminale. */
export function GradePicker({ value, onChange, tone = 'student', layout = 'grouped' }: Props) {
  if (layout === 'grid') {
    return (
      <View role="radiogroup" accessibilityLabel={fr.form.grade} style={styles.grid}>
        {GRADES.map((grade) => (
          <View key={grade} style={styles.gridCell}>
            <GradeChip
              grade={grade}
              selected={grade === value}
              onPress={() => onChange(grade)}
              tone={tone}
              layout="grid"
            />
          </View>
        ))}
      </View>
    );
  }
  return (
    <View role="radiogroup" accessibilityLabel={fr.form.grade} style={styles.groups}>
      {GRADE_GROUPS.map((group) => (
        <View key={group.id} style={styles.group}>
          <Text variant="overline" color="textSecondary">
            {fr.form.gradeGroups[group.id]}
          </Text>
          <View style={layout === 'columns' ? styles.columns : styles.wrap}>
            {group.grades.map((grade) => (
              <View key={grade} style={layout === 'columns' ? styles.column : null}>
                <GradeChip
                  grade={grade}
                  selected={grade === value}
                  onPress={() => onChange(grade)}
                  tone={tone}
                  layout={layout}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  groups: { gap: theme.space[4] },
  group: { gap: theme.space[2] },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  chip: {
    minWidth: 68,
    height: 52,
    borderRadius: theme.radius['2xl'],
    overflow: 'hidden',
  },
  gridChip: { height: theme.space[12], borderRadius: theme.radius['2xl'], overflow: 'hidden' },
  idle: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[4],
  },
  columns: { flexDirection: 'row', marginHorizontal: -4 },
  column: { width: '20%', paddingHorizontal: theme.space[1] },
  columnChip: { borderRadius: 14 },
  idleFilled: {
    borderWidth: 1,
    borderColor: theme.auth.field.filledBorder,
    backgroundColor: theme.colors.bg,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, rowGap: theme.space[2] },
  gridCell: { width: '25%', paddingHorizontal: theme.space[1] },
});
