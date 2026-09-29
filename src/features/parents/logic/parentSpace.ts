import type { SubjectId } from '@/data/types';
import { parisDay } from '@/lib/parisTime';
import type {
  ChapterProgress,
  ChapterStatus,
  ParentSession,
  ParentWeek,
  SessionMode,
} from '@/services/parents/ParentService';

// ---------------------------------------------------------------------------
// Semaine (P1)
// ---------------------------------------------------------------------------

export type WeekTotals = {
  minutes: number;
  deltaMinutes: number;
  activeDays: number;
  deltaActiveDays: number;
};

export function weekTotals(week: ParentWeek): WeekTotals {
  const minutes = week.days.reduce((sum, day) => sum + day.minutes, 0);
  const activeDays = week.days.filter((day) => day.minutes > 0).length;
  return {
    minutes,
    deltaMinutes: minutes - week.previousMinutes,
    activeDays,
    deltaActiveDays: activeDays - week.previousActiveDays,
  };
}

/** Objectif du jour dérivé de l'objectif hebdomadaire (P4) : 4 h → 34 min. */
export function dailyGoalMinutes(weeklyGoalHours: number): number {
  return Math.round((weeklyGoalHours * 60) / 7);
}

/** Les matières les plus travaillées de la semaine, de la plus longue à la plus courte. */
export function topSubjects(
  minutesBySubject: ParentWeek['minutesBySubject'],
  count = 2,
): SubjectId[] {
  return (Object.entries(minutesBySubject) as [SubjectId, number][])
    .filter(([, minutes]) => minutes > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([subject]) => subject);
}

export type WeekVerdict = 'great' | 'good' | 'quiet';

/** Pastille du résumé : objectif atteint et en hausse, objectif presque atteint, ou semaine calme. */
export function weekVerdict(totals: WeekTotals, weeklyGoalHours: number): WeekVerdict {
  const goal = weeklyGoalHours * 60;
  if (totals.minutes >= goal && totals.deltaMinutes >= 0) return 'great';
  if (totals.minutes >= goal * 0.6) return 'good';
  return 'quiet';
}

export type BarKind = 'reached' | 'below' | 'empty';

/** Barres du graphique : dégradé quand l'objectif du jour est atteint, bleu clair en dessous. */
export function dayBarKind(minutes: number, goalMinutes: number): BarKind {
  if (minutes <= 0) return 'empty';
  return minutes >= goalMinutes ? 'reached' : 'below';
}

/** Créneau de deux heures où l'enfant travaille le plus (17 → « entre 17 h et 19 h »). */
export function peakWindowStart(sessionHours: readonly number[]): number | null {
  if (sessionHours.length === 0) return null;
  let best = sessionHours[0] ?? 0;
  let bestCount = 0;
  for (let start = 0; start < 23; start += 1) {
    const count = sessionHours.filter((hour) => hour >= start && hour < start + 2).length;
    if (count > bestCount) {
      best = start;
      bestCount = count;
    }
  }
  return best;
}

export const EVENING_PAUSE_HOUR = 21;

export function lateSessionCount(sessionHours: readonly number[]): number {
  return sessionHours.filter((hour) => hour >= EVENING_PAUSE_HOUR).length;
}

// ---------------------------------------------------------------------------
// Progrès (P2)
// ---------------------------------------------------------------------------

/** Seuils des statuts : 80 % acquis, 50 % en cours, en dessous à consolider. */
export function chapterStatus(
  chapter: Pick<ChapterProgress, 'mastery' | 'sessions'>,
): ChapterStatus {
  if (chapter.sessions === 0 || chapter.mastery === null) return 'notStarted';
  if (chapter.mastery >= 0.8) return 'acquired';
  if (chapter.mastery >= 0.5) return 'inProgress';
  return 'toConsolidate';
}

const percent = (value: number) => Math.round(value * 100);

const average = (values: readonly number[]) =>
  values.length === 0 ? null : values.reduce((sum, v) => sum + v, 0) / values.length;

export type SubjectSummary = {
  subjectId: SubjectId;
  /** Maîtrise moyenne des chapitres travaillés, en %. */
  mastery: number | null;
  /** Évolution en points sur la période. */
  delta: number | null;
  counts: Record<ChapterStatus, number>;
  chapters: readonly (ChapterProgress & { status: ChapterStatus })[];
};

export function summarizeSubject(
  subjectId: SubjectId,
  chapters: readonly ChapterProgress[],
  previousMastery: Partial<Record<string, number>>,
): SubjectSummary {
  const own = chapters.filter((chapter) => chapter.subjectId === subjectId);
  const worked = own.filter((chapter) => chapter.sessions > 0 && chapter.mastery !== null);
  const now = average(worked.map((chapter) => chapter.mastery ?? 0));
  // Sans photo en début de période (chapitre commencé depuis), l'évolution part de la valeur actuelle.
  const before = average(
    worked.map((chapter) => previousMastery[chapter.chapterId] ?? chapter.mastery ?? 0),
  );
  const counts: Record<ChapterStatus, number> = {
    acquired: 0,
    inProgress: 0,
    toConsolidate: 0,
    notStarted: 0,
  };
  const withStatus = own.map((chapter) => {
    const status = chapterStatus(chapter);
    counts[status] += 1;
    return { ...chapter, status };
  });
  return {
    subjectId,
    mastery: now === null ? null : percent(now),
    delta: now === null || before === null ? null : percent(now) - percent(before),
    counts,
    chapters: withStatus,
  };
}

export type GlobalMastery = {
  mastery: number;
  delta: number;
  acquired: number;
  toConsolidate: number;
};

export function globalMastery(subjects: readonly SubjectSummary[]): GlobalMastery {
  const rated = subjects.filter((s) => s.mastery !== null);
  const mastery = Math.round(average(rated.map((s) => s.mastery ?? 0)) ?? 0);
  const delta = Math.round(average(rated.map((s) => s.delta ?? 0)) ?? 0);
  const acquired = subjects.reduce((sum, s) => sum + s.counts.acquired, 0);
  const toConsolidate = subjects.reduce((sum, s) => sum + s.counts.toConsolidate, 0);
  return { mastery, delta, acquired, toConsolidate };
}

// ---------------------------------------------------------------------------
// Alerte et conseil (P1)
// ---------------------------------------------------------------------------

export type ParentAlert = {
  chapterId: string;
  subjectId: SubjectId;
  successRate: number;
  sessions: number;
};

/**
 * Une notion bloquante : au moins 3 séances et moins de 50 % de réussite.
 * La plus faible l'emporte ; sans notion bloquante, aucune alerte n'est affichée.
 */
export function pickAlert(chapters: readonly ChapterProgress[]): ParentAlert | null {
  const blocking = chapters
    .filter((chapter) => chapter.sessions >= 3 && chapter.mastery !== null && chapter.mastery < 0.5)
    .sort((a, b) => (a.mastery ?? 0) - (b.mastery ?? 0));
  const worst = blocking[0];
  if (!worst || worst.mastery === null) return null;
  return {
    chapterId: worst.chapterId,
    subjectId: worst.subjectId,
    successRate: percent(worst.mastery),
    sessions: worst.sessions,
  };
}

export type Advice =
  { kind: 'explain'; chapterId: string } | { kind: 'routine' } | { kind: 'celebrate' };

/**
 * Conseil choisi parmi des formulations rédigées à l'avance :
 * faire expliquer une notion acquise cette semaine, sinon installer un rythme, sinon féliciter.
 */
export function pickAdvice(week: ParentWeek, totals: WeekTotals): Advice {
  const recent = week.acquiredThisWeek[0];
  if (recent) return { kind: 'explain', chapterId: recent };
  if (totals.activeDays < 4) return { kind: 'routine' };
  return { kind: 'celebrate' };
}

// ---------------------------------------------------------------------------
// Sessions (P3)
// ---------------------------------------------------------------------------

export type SessionDay = { day: string; sessions: readonly ParentSession[] };

/** Séances regroupées par jour (heure de Paris), du plus récent au plus ancien. */
export function groupSessionsByDay(sessions: readonly ParentSession[]): SessionDay[] {
  const sorted = [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const groups: { day: string; sessions: ParentSession[] }[] = [];
  for (const session of sorted) {
    const day = parisDay(new Date(session.startedAt));
    const group = groups.find((g) => g.day === day);
    if (group) group.sessions.push(session);
    else groups.push({ day, sessions: [session] });
  }
  return groups;
}

export type SessionStats = { count: number; minutes: number; byMode: Record<SessionMode, number> };

export function sessionStats(sessions: readonly ParentSession[]): SessionStats {
  const byMode: Record<SessionMode, number> = { written: 0, voice: 0, flashcards: 0 };
  let minutes = 0;
  for (const session of sessions) {
    byMode[session.mode] += 1;
    minutes += session.durationMinutes;
  }
  return { count: sessions.length, minutes, byMode };
}

/** Matières présentes dans les séances, dans l'ordre de leur première apparition. */
export function sessionSubjects(sessions: readonly ParentSession[]): SubjectId[] {
  const seen: SubjectId[] = [];
  for (const session of [...sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))) {
    if (!seen.includes(session.subjectId)) seen.push(session.subjectId);
  }
  return seen;
}
