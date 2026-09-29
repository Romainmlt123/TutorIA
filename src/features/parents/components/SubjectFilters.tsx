import { StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';

type Props = {
  subjects: readonly SubjectId[];
  selected: SubjectId | null;
  onSelect: (subject: SubjectId | null) => void;
};

/** P3 · Filtres par matière : pastilles de 40 px avec un point de couleur, sélection en `primary`. */
export function SubjectFilters({ subjects, selected, onSelect }: Props) {
  const options: { id: SubjectId | null; label: string; dot: string }[] = [
    { id: null, label: fr.parent.sessions.all, dot: theme.colors.primary },
    ...subjects.map((id) => ({
      id,
      label: subjectTheme(id).name,
      dot: subjectTheme(id).gradient.colors[0] ?? theme.colors.primary,
    })),
  ];
  return (
    <View role="group" accessibilityLabel={fr.parent.sessions.filterLabel} style={styles.row}>
      {options.map((option) => {
        const active = option.id === selected;
        return (
          <PressableBase
            key={option.id ?? 'all'}
            onPress={() => onSelect(option.id)}
            role="radio"
            aria-checked={active}
            accessibilityLabel={option.label}
            shadow={theme.shadow.sm}
            style={[
              styles.chip,
              { backgroundColor: active ? theme.colors.primary : theme.colors.surface },
            ]}>
            <View
              style={[
                styles.dot,
                { backgroundColor: active ? theme.colors.textOnColor : option.dot },
              ]}
            />
            <Text variant="label" weight="bold" color={active ? 'textOnColor' : 'text'}>
              {option.label}
            </Text>
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  chip: {
    height: theme.space[10],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: 14,
    borderRadius: theme.radius.full,
  },
  dot: { width: 10, height: 10, borderRadius: theme.radius.full },
});
