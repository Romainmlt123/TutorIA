import { chapterTitle } from '@/data/curriculum';
import type { Insight, PeriodKey, PeriodStats } from '@/data/types';
import { fr } from '@/i18n/fr';
import { addDays, dayOfMonth, mondayOf, monthIndex } from '@/lib/parisTime';
import type { ChapterProgress } from '@/services/parents/ParentService';
import type { ActivityDay } from '@/services/student';

const WEEK_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

const shiftMonth = (day: string, offset: number) => {
  const date = new Date(`${day.slice(0, 7)}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
};

const monthEnd = (monthStart: string) => addDays(shiftMonth(monthStart, 1), -1);

type Totals = { minutes: number; sessions: number; cards: number };

function totals(activity: readonly ActivityDay[], from: string, to: string): Totals {
  return activity
    .filter((row) => row.day >= from && row.day <= to)
    .reduce(
      (sum, row) => ({
        minutes: sum.minutes + row.minutes,
        sessions: sum.sessions + row.sessions,
        cards: sum.cards + row.cards,
      }),
      { minutes: 0, sessions: 0, cards: 0 },
    );
}

/** Buckets de l'histogramme et périodes comparées, à partir des agrégats quotidiens (heure de Paris). */
function buckets(period: PeriodKey, today: string) {
  if (period === 'week') {
    const monday = mondayOf(today);
    return {
      current: { from: monday, to: addDays(monday, 6) },
      previous: { from: addDays(monday, -7), to: addDays(monday, -1) },
      series: WEEK_LABELS.map((label, i) => ({
        label,
        from: addDays(monday, i),
        to: addDays(monday, i),
      })),
    };
  }
  if (period === 'month') {
    const first = shiftMonth(today, 0);
    const series = [];
    for (let start = 1; start <= dayOfMonth(today); start += 7) {
      const end = Math.min(start + 6, dayOfMonth(today));
      series.push({
        label: `${start}–${end}`,
        from: addDays(first, start - 1),
        to: addDays(first, end - 1),
      });
    }
    const previousFirst = shiftMonth(today, -1);
    return {
      current: { from: first, to: today },
      previous: { from: previousFirst, to: monthEnd(previousFirst) },
      series,
    };
  }
  const start = shiftMonth(today, -2);
  return {
    current: { from: start, to: today },
    previous: { from: shiftMonth(today, -5), to: addDays(start, -1) },
    series: [0, 1, 2].map((i) => {
      const month = shiftMonth(start, i);
      const label = fr.dates.monthsShort[monthIndex(month)] ?? '';
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1),
        from: month,
        to: monthEnd(month),
      };
    }),
  };
}

/** Chiffres de Stats pour une période : temps, séances, cartes, et histogramme. */
export function periodStatsFrom(
  activity: readonly ActivityDay[],
  period: PeriodKey,
  today: string,
): PeriodStats {
  const { current, previous, series } = buckets(period, today);
  const now = totals(activity, current.from, current.to);
  const before = totals(activity, previous.from, previous.to);
  return {
    studyMinutes: { current: now.minutes, previous: before.minutes },
    sessions: { current: now.sessions, previous: before.sessions },
    cardsReviewed: { current: now.cards, previous: before.cards },
    series: series.map((bucket) => ({
      label: bucket.label,
      minutes: totals(activity, bucket.from, bucket.to).minutes,
    })),
  };
}

/** 13 semaines du calendrier d'activité, jusqu'au dimanche de la semaine en cours. */
export const HEATMAP_WEEKS = 13;

export function heatmapInput(activity: readonly ActivityDay[], today: string) {
  const start = addDays(mondayOf(today), -(HEATMAP_WEEKS - 1) * 7);
  const minutes = Array.from({ length: HEATMAP_WEEKS * 7 }, (_, i) => {
    const day = addDays(start, i);
    return activity.find((row) => row.day === day)?.minutes ?? 0;
  });
  return { start, minutes };
}

const insight = (chapter: ChapterProgress): Insight => ({
  notion: chapterTitle(chapter.chapterId),
  chapterId: chapter.chapterId,
  score: chapter.mastery ?? 0,
});

/** Points forts : chapitres maîtrisés à 80 % ou plus, les trois meilleurs. */
export function strengthsFrom(chapters: readonly ChapterProgress[]): Insight[] {
  return chapters
    .filter((c) => c.sessions > 0 && (c.mastery ?? 0) >= 0.8)
    .sort((a, b) => (b.mastery ?? 0) - (a.mastery ?? 0))
    .slice(0, 3)
    .map(insight);
}

/** À retravailler : chapitres travaillés sous 60 %, les trois plus fragiles. */
export function toWorkFrom(chapters: readonly ChapterProgress[]): Insight[] {
  return chapters
    .filter((c) => c.sessions > 0 && c.mastery !== null && c.mastery < 0.6)
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0))
    .slice(0, 3)
    .map(insight);
}
