import { StyleSheet, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { SubjectIconBadge } from '@/components/subject/SubjectIconBadge';
import { Text } from '@/components/Text';
import type { Subject } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';

/** Progression par matière, de la plus maîtrisée à la moins maîtrisée. */
export function SubjectProgressList({ subjects }: { subjects: readonly Subject[] }) {
  const sorted = [...subjects].sort((a, b) => b.mastery - a.mastery);
  return (
    <View style={styles.list}>
      {sorted.map((subject) => {
        const percent = Math.round(subject.mastery * 100);
        const colors = subjectTheme(subject.id);
        return (
          <View
            key={subject.id}
            accessible
            accessibilityLabel={fr.home.subjectCardLabel(subject.name, percent)}
            style={styles.row}>
            <SubjectIconBadge subjectId={subject.id} size={36} />
            <Text variant="label" style={styles.name}>
              {subject.name}
            </Text>
            <View style={styles.bar}>
              <ProgressBar
                value={subject.mastery}
                height={12}
                trackColor={colors.soft}
                fill={colors.progress}
              />
            </View>
            <Text variant="label" weight="bold" align="right" style={styles.percent}>
              {`${percent} %`}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: theme.space[3] },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  name: { width: 104 },
  bar: { flex: 1 },
  percent: { width: 40 },
});
