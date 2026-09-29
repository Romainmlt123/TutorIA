import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import type { PeriodKey } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { ActivityHeatmap } from './components/ActivityHeatmap';
import { BarChart } from './components/BarChart';
import { ChartCard } from './components/ChartCard';
import { InsightList } from './components/InsightList';
import { KpiCard } from './components/KpiCard';
import { MasteryCard } from './components/MasteryCard';
import { SubjectProgressList } from './components/SubjectProgressList';
import { useStats } from './hooks/useStats';

const PERIODS = [
  { value: 'week', label: fr.stats.periods.week },
  { value: 'month', label: fr.stats.periods.month },
  { value: 'quarter', label: fr.stats.periods.quarter },
] as const;

/** 04 · Stats (design/screens/04-Stats.dc.html). */
export function StatsScreen() {
  const router = useRouter();
  const [period, setPeriod] = useState<PeriodKey>('week');
  const stats = useStats(period);

  return (
    <ScreenContainer contentStyle={styles.content}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {fr.stats.title}
      </Text>
      <SegmentedControl
        options={PERIODS}
        value={period}
        onChange={setPeriod}
        accessibilityLabel={fr.stats.periodLabel}
        fullWidth
      />

      <View accessibilityLabel={fr.stats.keyFigures} style={styles.kpis}>
        <View style={styles.kpiRow}>
          <KpiCard
            icon="horloge"
            label={fr.stats.studyTime}
            background={theme.kpi.time}
            {...stats.kpis.time}
          />
          <KpiCard
            icon="cible"
            label={fr.stats.sessions}
            background={theme.kpi.sessions}
            {...stats.kpis.sessions}
          />
        </View>
        <View style={styles.kpiRow}>
          <KpiCard
            icon="revisions"
            label={fr.stats.cardsReviewed}
            background={theme.kpi.flashcards}
            {...stats.kpis.cards}
          />
          <KpiCard
            icon="flamme"
            label={fr.stats.recordStreak}
            background={{ solid: theme.kpi.record.background }}
            {...stats.kpis.record}
          />
        </View>
      </View>

      <ChartCard title={stats.chart.title} meta={stats.chart.average}>
        <BarChart series={stats.chart.series} accessibilityLabel={stats.chart.title} />
      </ChartCard>

      <ChartCard title={fr.stats.subjectProgress} hint={fr.stats.subjectProgressHint}>
        <SubjectProgressList subjects={stats.subjects} />
      </ChartCard>

      <MasteryCard points={stats.mastery} unit={stats.masteryUnit} />

      <ChartCard
        title={fr.stats.activity}
        meta={fr.stats.activeDays(stats.heatmap.activeDays, stats.heatmap.totalDays)}>
        <ActivityHeatmap heatmap={stats.heatmap} />
      </ChartCard>

      <InsightList kind="strengths" items={stats.strengths} />
      <InsightList
        kind="toWork"
        items={stats.toWork}
        onReview={(item) =>
          router.navigate({ pathname: '/revisions', params: { chapter: item.id } })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  kpis: { gap: theme.space[3] },
  kpiRow: { flexDirection: 'row', gap: theme.space[3] },
});
