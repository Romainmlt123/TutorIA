import type { ActivityDay } from '@/services/student';

import { heatmapInput, periodStatsFrom, strengthsFrom, toWorkFrom } from './period';

const day = (d: string, minutes: number, sessions = 1, cards = 10): ActivityDay => ({
  day: d,
  minutes,
  sessions,
  cards,
});

const activity = [
  day('2026-06-15', 60),
  day('2026-08-20', 30),
  day('2026-09-14', 25),
  day('2026-09-21', 35),
  day('2026-09-27', 15),
  day('2026-09-28', 40),
  day('2026-09-30', 20),
];

describe('periodStatsFrom', () => {
  it('compares the current week with the previous one', () => {
    const stats = periodStatsFrom(activity, 'week', '2026-09-30');
    expect(stats.studyMinutes).toEqual({ current: 60, previous: 50 });
    expect(stats.sessions).toEqual({ current: 2, previous: 2 });
    expect(stats.series.map((s) => s.minutes)).toEqual([40, 0, 20, 0, 0, 0, 0]);
    expect(stats.series.map((s) => s.label)).toEqual(['L', 'M', 'M', 'J', 'V', 'S', 'D']);
  });

  it('splits the month in weeks up to today', () => {
    const stats = periodStatsFrom(activity, 'month', '2026-09-27');
    expect(stats.series.map((s) => s.label)).toEqual(['1–7', '8–14', '15–21', '22–27']);
    expect(stats.series.map((s) => s.minutes)).toEqual([0, 25, 35, 15]);
    expect(stats.studyMinutes).toEqual({ current: 75, previous: 30 });
  });

  it('covers three months for the quarter', () => {
    const stats = periodStatsFrom(activity, 'quarter', '2026-09-30');
    expect(stats.series.map((s) => s.label)).toEqual(['Juil.', 'Août', 'Sept.']);
    expect(stats.series.map((s) => s.minutes)).toEqual([0, 30, 135]);
    expect(stats.studyMinutes.previous).toBe(60);
  });
});

describe('heatmapInput', () => {
  it('ends on the Sunday of the current week', () => {
    const { start, minutes } = heatmapInput(activity, '2026-09-30');
    expect(start).toBe('2026-07-06');
    expect(minutes).toHaveLength(91);
    expect(minutes[84]).toBe(40);
  });
});

describe('insights', () => {
  const chapters = [
    { chapterId: 'en-preterit', subjectId: 'anglais' as const, mastery: 0.92, sessions: 4 },
    {
      chapterId: 'pc-masse-volumique',
      subjectId: 'physique-chimie' as const,
      mastery: 0.41,
      sessions: 3,
    },
    { chapterId: 'maths-pythagore', subjectId: 'maths' as const, mastery: 0.61, sessions: 3 },
    { chapterId: 'svt-digestion', subjectId: 'svt' as const, mastery: 0.9, sessions: 0 },
  ];

  it('keeps the mastered chapters as strengths', () => {
    expect(strengthsFrom(chapters).map((i) => i.chapterId)).toEqual(['en-preterit']);
  });

  it('keeps the fragile chapters to work on', () => {
    expect(toWorkFrom(chapters)).toEqual([
      { notion: 'La masse volumique', chapterId: 'pc-masse-volumique', score: 0.41 },
    ]);
  });
});
