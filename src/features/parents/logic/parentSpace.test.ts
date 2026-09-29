import { demoChapters, demoPreviousMastery, demoSessions, demoWeek } from '@/data/mock/parentSpace';

import { dayLabel, weekRangeLabel } from './dates';
import {
  chapterStatus,
  dailyGoalMinutes,
  dayBarKind,
  globalMastery,
  groupSessionsByDay,
  lateSessionCount,
  peakWindowStart,
  pickAdvice,
  pickAlert,
  sessionStats,
  summarizeSubject,
  topSubjects,
  weekTotals,
  weekVerdict,
} from './parentSpace';

const today = new Date('2026-09-28T16:00:00Z');

describe('week summary (P1)', () => {
  const week = demoWeek(today);
  const totals = weekTotals(week);

  it('adds up the week and compares it with the previous one', () => {
    expect(totals).toEqual({ minutes: 280, deltaMinutes: 38, activeDays: 6, deltaActiveDays: 1 });
  });

  it('keeps the two most studied subjects', () => {
    expect(topSubjects(week.minutesBySubject)).toEqual(['maths', 'anglais']);
  });

  it('derives the daily goal from the weekly goal', () => {
    expect(dailyGoalMinutes(4)).toBe(34);
    expect(dayBarKind(40, 34)).toBe('reached');
    expect(dayBarKind(20, 34)).toBe('below');
    expect(dayBarKind(0, 34)).toBe('empty');
  });

  it('rates the week against the goal', () => {
    expect(weekVerdict(totals, 4)).toBe('great');
    expect(weekVerdict({ ...totals, minutes: 160 }, 4)).toBe('good');
    expect(weekVerdict({ ...totals, minutes: 60 }, 4)).toBe('quiet');
  });

  it('finds the usual study window and the late sessions', () => {
    expect(peakWindowStart(week.sessionHours)).toBe(17);
    expect(lateSessionCount(week.sessionHours)).toBe(0);
    expect(lateSessionCount([20, 21, 22])).toBe(2);
  });

  it('labels the week in French', () => {
    expect(weekRangeLabel('2026-09-21')).toBe('du 21 au 27 septembre');
    expect(weekRangeLabel('2026-09-28')).toBe('du 28 septembre au 4 octobre');
  });
});

describe('chapter statuses (P2)', () => {
  it('uses the 80 % and 50 % thresholds', () => {
    expect(chapterStatus({ mastery: 0.88, sessions: 6 })).toBe('acquired');
    expect(chapterStatus({ mastery: 0.8, sessions: 3 })).toBe('acquired');
    expect(chapterStatus({ mastery: 0.61, sessions: 3 })).toBe('inProgress');
    expect(chapterStatus({ mastery: 0.48, sessions: 2 })).toBe('toConsolidate');
    expect(chapterStatus({ mastery: null, sessions: 0 })).toBe('notStarted');
  });

  it('summarizes a subject like the mockup', () => {
    const maths = summarizeSubject('maths', demoChapters, demoPreviousMastery.month);
    expect(maths.mastery).toBe(70);
    expect(maths.counts).toEqual({ acquired: 2, inProgress: 1, toConsolidate: 1, notStarted: 1 });
    expect(maths.chapters.map((c) => c.status)).toEqual([
      'acquired',
      'acquired',
      'inProgress',
      'toConsolidate',
      'notStarted',
    ]);
    expect(maths.delta).toBeGreaterThan(0);
  });

  it('computes the overall mastery from the subjects', () => {
    const subjects = (['maths', 'anglais'] as const).map((id) =>
      summarizeSubject(id, demoChapters, demoPreviousMastery.month),
    );
    const global = globalMastery(subjects);
    expect(global.acquired).toBe(4);
    expect(global.toConsolidate).toBe(1);
  });
});

describe('alert and advice (P1)', () => {
  it('flags the weakest blocking notion only', () => {
    expect(pickAlert(demoChapters)).toEqual({
      chapterId: 'pc-masse-volumique',
      subjectId: 'physique-chimie',
      successRate: 41,
      sessions: 3,
    });
  });

  it('shows no alert without a real blocking notion', () => {
    expect(
      pickAlert(
        demoChapters.filter(
          (c) => c.chapterId !== 'pc-masse-volumique' && c.chapterId !== 'hg-revolution',
        ),
      ),
    ).toBeNull();
    expect(
      pickAlert([{ chapterId: 'x', subjectId: 'maths', mastery: 0.2, sessions: 2 }]),
    ).toBeNull();
  });

  it('suggests explaining a notion acquired this week', () => {
    const week = demoWeek(today);
    expect(pickAdvice(week, weekTotals(week))).toEqual({
      kind: 'explain',
      chapterId: 'maths-equations',
    });
    const quiet = { ...week, acquiredThisWeek: [] };
    expect(pickAdvice(quiet, { ...weekTotals(week), activeDays: 2 })).toEqual({ kind: 'routine' });
  });
});

describe('sessions (P3)', () => {
  const sessions = demoSessions(today);

  it('counts the sessions of the week by mode', () => {
    expect(sessionStats(sessions)).toEqual({
      count: 9,
      minutes: 280,
      byMode: { written: 5, voice: 2, flashcards: 2 },
    });
  });

  it('groups the sessions by Paris day, most recent first', () => {
    const groups = groupSessionsByDay(sessions);
    expect(groups.map((g) => g.day)).toEqual([
      '2026-09-28',
      '2026-09-27',
      '2026-09-26',
      '2026-09-25',
      '2026-09-23',
      '2026-09-22',
    ]);
    expect(groups[0]?.sessions.map((s) => s.subjectId)).toEqual(['maths', 'anglais']);
  });

  it('labels the days', () => {
    expect(dayLabel('2026-09-28', '2026-09-28')).toBe('Aujourd’hui');
    expect(dayLabel('2026-09-27', '2026-09-28')).toBe('Hier');
    expect(dayLabel('2026-09-24', '2026-09-28')).toBe('Jeudi 24 septembre');
  });
});
