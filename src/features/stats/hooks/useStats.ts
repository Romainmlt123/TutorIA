import { useQuery } from '@tanstack/react-query';

import { chapterById } from '@/data/curriculum';
import type { Insight, PeriodKey, Subject, SubjectId } from '@/data/types';
import { subjectMastery } from '@/features/home/logic/home';
import { fr } from '@/i18n/fr';
import { addDays, parisDay } from '@/lib/parisTime';
import {
  studentKeys,
  useStudentChapters,
  useStudentOverview,
} from '@/lib/session/useStudentOverview';
import { studentDataService } from '@/services/student';
import { subjectTheme } from '@/theme';

import {
  averagePerBucket,
  daysToBeatRecord,
  formatCount,
  formatCountDelta,
  formatDuration,
  formatDurationDelta,
} from '../logic/format';
import { buildHeatmap } from '../logic/heatmap';
import { heatmapInput, periodStatsFrom, strengthsFrom, toWorkFrom } from '../logic/period';

/** Ordre des matières de Stats (04-Stats). */
const SUBJECTS: readonly SubjectId[] = [
  'maths',
  'francais',
  'histoire-geo',
  'anglais',
  'svt',
  'physique-chimie',
];

/** Six mois d'agrégats : le trimestre en cours et le précédent. */
const HISTORY_DAYS = 190;

const toItems = (insights: readonly Insight[]) =>
  insights.map((i) => ({
    id: i.chapterId,
    notion: i.notion,
    subjectName: subjectTheme(chapterById(i.chapterId)?.subjectId ?? 'maths').name,
    percent: Math.round(i.score * 100),
  }));

/** Statistiques affichées pour une période (Semaine, Mois, Trimestre), calculées depuis la base. */
export function useStats(period: PeriodKey, now = new Date()) {
  const today = parisDay(now);
  const overview = useStudentOverview();
  const chapters = useStudentChapters();
  const activity = useQuery({
    queryKey: [...studentKeys.activity, today],
    queryFn: () => studentDataService.activity(addDays(today, -HISTORY_DAYS)),
  });
  const mastery = useQuery({
    queryKey: studentKeys.mastery,
    queryFn: () => studentDataService.masteryHistory(),
  });

  const days = activity.data ?? [];
  const stats = periodStatsFrom(days, period, today);
  const comparison = fr.stats.comparison[period];
  const { studyMinutes, sessions, cardsReviewed } = stats;
  const heat = heatmapInput(days, today);
  const subjects: Subject[] = SUBJECTS.map((id) => ({
    id,
    name: subjectTheme(id).name,
    mastery: subjectMastery(chapters, id),
  }));

  return {
    kpis: {
      time: {
        value: formatDuration(studyMinutes.current),
        caption: `${formatDurationDelta(studyMinutes.current - studyMinutes.previous)} ${comparison}`,
      },
      sessions: {
        value: formatCount(sessions.current),
        caption: `${formatCountDelta(sessions.current - sessions.previous)} ${comparison}`,
      },
      cards: {
        value: formatCount(cardsReviewed.current),
        caption: `${formatCountDelta(cardsReviewed.current - cardsReviewed.previous)} ${comparison}`,
      },
      record: {
        value: fr.home.streakDays(overview.recordStreak),
        caption: fr.stats.daysToBeat(daysToBeatRecord(overview.streakDays, overview.recordStreak)),
      },
    },
    chart: {
      title: fr.stats.chartTitle[period],
      average: fr.stats.average[period](
        formatDuration(averagePerBucket(stats.series.map((s) => s.minutes))),
      ),
      series: stats.series,
    },
    subjects,
    // Une courbe demande au moins deux mesures.
    mastery: (mastery.data?.points.length ?? 0) >= 2 ? (mastery.data?.points ?? []) : [],
    masteryUnit: mastery.data?.unit ?? 'week',
    heatmap: buildHeatmap(new Date(`${heat.start}T12:00:00`), heat.minutes),
    strengths: toItems(strengthsFrom(chapters)),
    toWork: toItems(toWorkFrom(chapters)),
  };
}
