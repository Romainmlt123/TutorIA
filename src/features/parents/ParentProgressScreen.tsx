import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionCard } from '@/components/SectionCard';
import { SegmentedControl } from '@/components/SegmentedControl';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import type { ChapterStatus, ProgressPeriod } from '@/services/parents';
import { theme } from '@/theme';

import { ParentBand } from './components/ParentBand';
import { MasteryHeroCard } from './components/MasteryHeroCard';
import { StatusChip } from './components/StatusChip';
import { SubjectProgressCard } from './components/SubjectProgressCard';
import { useChildProgress } from './hooks/useParentData';
import { useSelectedChild } from './hooks/useSelectedChild';
import { globalMastery, summarizeSubject } from './logic/parentSpace';

/** Ordre de la maquette P2. */
const SUBJECTS: readonly SubjectId[] = [
  'maths',
  'anglais',
  'svt',
  'francais',
  'histoire-geo',
  'physique-chimie',
];

const STATUSES: readonly ChapterStatus[] = [
  'acquired',
  'inProgress',
  'toConsolidate',
  'notStarted',
];

const t = fr.parent.progress;

/** P2 · Progrès par matière : statuts des chapitres plutôt que des pourcentages bruts. */
export function ParentProgressScreen() {
  const { child } = useSelectedChild();
  const [period, setPeriod] = useState<ProgressPeriod>('month');
  const [open, setOpen] = useState<SubjectId | null>('maths');
  const progress = useChildProgress(child?.id ?? null, period);

  const subjects = progress.data
    ? SUBJECTS.map((id) =>
        summarizeSubject(id, progress.data.chapters, progress.data.previousMastery),
      )
    : [];

  return (
    <ScreenContainer
      contentStyle={styles.content}
      band={
        <ParentBand title={t.title(child?.firstName ?? '')} intro={t.subtitle}>
          <SegmentedControl
            options={[
              { value: 'month', label: t.periods.month },
              { value: 'quarter', label: t.periods.quarter },
            ]}
            value={period}
            onChange={setPeriod}
            accessibilityLabel={t.periodLabel}
            fullWidth
            onBand="violet"
          />
        </ParentBand>
      }>
      {progress.isError ? (
        <View style={styles.section}>
          <FormMessage message={fr.parent.home.loadFailed} />
          <Button
            label={fr.parent.home.retry}
            onPress={() => void progress.refetch()}
            variant="soft"
          />
        </View>
      ) : !progress.data ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <>
          <MasteryHeroCard global={globalMastery(subjects)} period={period} />
          <SectionCard title={t.bySubject} meta={t.tapHint} gap={theme.space[3]}>
            <View
              style={styles.legend}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              {STATUSES.map((status) => (
                <StatusChip key={status} status={status} compact />
              ))}
            </View>
            {subjects.map((summary) => (
              <SubjectProgressCard
                key={summary.subjectId}
                summary={summary}
                open={open === summary.subjectId}
                onToggle={() => setOpen(open === summary.subjectId ? null : summary.subjectId)}
              />
            ))}
          </SectionCard>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  section: { gap: theme.space[3] },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.space[2],
    marginBottom: theme.space[1],
  },
  loader: { marginTop: theme.space[8] },
});
