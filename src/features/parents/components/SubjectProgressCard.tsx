import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { chapterTitle } from '@/data/curriculum';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';

import type { SubjectSummary } from '../logic/parentSpace';
import { StatusChip } from './StatusChip';

type Props = { summary: SubjectSummary; open: boolean; onToggle: () => void };

/** P2 · Carte dépliable d'une matière : maîtrise, évolution, barre segmentée et chapitres. */
export function SubjectProgressCard({ summary, open, onToggle }: Props) {
  const t = fr.parent.progress;
  const subject = subjectTheme(summary.subjectId);
  const counts = [
    summary.counts.acquired ? t.counts.acquired(summary.counts.acquired) : null,
    summary.counts.inProgress ? t.counts.inProgress(summary.counts.inProgress) : null,
    summary.counts.toConsolidate ? t.counts.toConsolidate(summary.counts.toConsolidate) : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const percent = summary.mastery === null ? '–' : `${summary.mastery} %`;
  const up = (summary.delta ?? 0) >= 0;
  return (
    <View style={[styles.card, { backgroundColor: subject.soft }]}>
      <PressableBase
        onPress={onToggle}
        accessibilityRole="button"
        aria-expanded={open}
        accessibilityLabel={t.subjectLabel(subject.name, percent)}
        style={styles.head}>
        <View style={styles.top}>
          <GradientSurface
            gradient={subject.gradient}
            radius={theme.radius['2xl']}
            style={styles.tile}
            contentStyle={styles.center}>
            <Icon name={subject.icon} size={22} color={theme.colors.textOnColor} />
          </GradientSurface>
          <View style={styles.names}>
            <Text variant="cardTitle">{subject.name}</Text>
            <Text variant="caption" weight="regular" color="textSecondary">
              {counts || t.noData}
            </Text>
          </View>
          <View style={styles.values}>
            <Text variant="section">{percent}</Text>
            {summary.delta !== null ? (
              <Pill
                label={t.deltaPoints(summary.delta)}
                backgroundColor={up ? theme.colors.successSoft : theme.colors.warningSoft}
                color={up ? theme.colors.successStrong : theme.colors.warningStrong}
                size="xs"
              />
            ) : null}
          </View>
        </View>
        <View style={styles.segments} accessibilityElementsHidden importantForAccessibility="no">
          {summary.chapters.map((chapter) => (
            <View
              key={chapter.chapterId}
              style={[
                styles.segment,
                { backgroundColor: theme.statuses[chapter.status].background },
              ]}
            />
          ))}
        </View>
        <View style={styles.toggle}>
          <Text variant="caption" weight="bold" color={subject.ink}>
            {open ? t.hideChapters : t.showChapters(summary.chapters.length)}
          </Text>
          <Icon
            name={open ? 'chevron-haut' : 'chevron-bas'}
            size={16}
            color={subject.ink}
            strokeWidth={2.25}
          />
        </View>
      </PressableBase>
      {open ? (
        <View style={styles.chapters}>
          {summary.chapters.map((chapter) => (
            <View key={chapter.chapterId} style={[styles.chapter, styles.chapterRow]}>
              <View style={styles.chapterText}>
                <Text variant="label" weight="bold">
                  {chapterTitle(chapter.chapterId)}
                </Text>
                <Text variant="caption" weight="regular" color="textSecondary">
                  {chapter.status === 'notStarted' || chapter.mastery === null
                    ? t.notWorked
                    : t.chapterMeta(Math.round(chapter.mastery * 100), chapter.sessions)}
                </Text>
              </View>
              <StatusChip status={chapter.status} />
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Dans la carte « Par matière » : un bloc teinté de sa matière, sans ombre.
  card: { borderRadius: theme.radius['2xl'], overflow: 'hidden' },
  head: { gap: 14, paddingVertical: 18, paddingHorizontal: theme.space[5] },
  top: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tile: { width: theme.space[12], height: theme.space[12] },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  names: { flex: 1, gap: 2 },
  values: { alignItems: 'flex-end', gap: 2 },
  segments: { flexDirection: 'row', gap: theme.space[1], height: 10 },
  segment: { flex: 1, borderRadius: theme.radius.full },
  toggle: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: theme.space[1] },
  chapters: { gap: 10, paddingHorizontal: theme.space[5], paddingBottom: theme.space[5] },
  chapter: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: 10,
    paddingLeft: 14,
    paddingRight: theme.space[3],
    borderRadius: theme.radius['2xl'],
  },
  // Chapitres dépliés : lignes blanches dans le bloc (v2.5).
  chapterRow: { backgroundColor: theme.colors.surface },
  chapterText: { flex: 1 },
});
