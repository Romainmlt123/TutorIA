import { addDays, parisDay } from '@/lib/parisTime';
import type {
  ChapterProgress,
  ParentalSettings,
  ParentSession,
  ParentWeek,
} from '@/services/parents/ParentService';

/*
 * Espace Parents de démonstration : Claire suit Léa (4e), maquettes P1 à P4.
 * Les séances sont datées par rapport à aujourd'hui pour que « Aujourd'hui » et « Hier » restent justes.
 * Semaine : 9 séances, 4 h 40, 6 jours actifs sur 7, surtout en Maths et en Anglais.
 */

type SessionSeed = Omit<ParentSession, 'id' | 'startedAt'> & { daysAgo: number; time: string };

const SESSIONS: readonly SessionSeed[] = [
  {
    daysAgo: 0,
    time: '17:42',
    subjectId: 'maths',
    chapterId: 'maths-equations',
    durationMinutes: 45,
    mode: 'written',
    tools: ['whiteboard'],
    outcome: 'understood',
    summary:
      'Léa a résolu 3x + 5 = 20 sans aide. Elle confondait « diviser » et « soustraire » à la dernière étape ; c’est maintenant compris.',
  },
  {
    daysAgo: 0,
    time: '10:15',
    subjectId: 'anglais',
    chapterId: 'en-preterit',
    durationMinutes: 10,
    mode: 'voice',
    tools: [],
    outcome: 'understood',
    summary:
      'Conversation orale sur les vacances. Les verbes irréguliers les plus courants sont utilisés correctement.',
  },
  {
    daysAgo: 1,
    time: '18:05',
    subjectId: 'physique-chimie',
    chapterId: 'pc-masse-volumique',
    durationMinutes: 30,
    mode: 'written',
    tools: ['graph'],
    outcome: 'toReview',
    summary:
      'Les conversions d’unités (g/cm³ en kg/m³) restent difficiles. Le tuteur reprendra ce point à la prochaine session.',
  },
  {
    daysAgo: 2,
    time: '17:10',
    subjectId: 'maths',
    chapterId: 'maths-pythagore',
    durationMinutes: 10,
    mode: 'voice',
    tools: [],
    outcome: 'progressing',
    summary:
      'Calcul de l’hypoténuse bien compris. Retrouver un côté de l’angle droit demande encore un peu d’entraînement.',
  },
  {
    daysAgo: 3,
    time: '17:20',
    subjectId: 'francais',
    chapterId: 'fr-participe-passe',
    durationMinutes: 30,
    mode: 'flashcards',
    tools: [],
    outcome: 'progressing',
    summary:
      '12 cartes révisées, 8 réussies. L’accord avec « avoir » reste à consolider quand le complément est placé avant.',
  },
  {
    daysAgo: 3,
    time: '18:30',
    subjectId: 'svt',
    chapterId: 'svt-digestion',
    durationMinutes: 35,
    mode: 'written',
    tools: [],
    outcome: 'understood',
    summary: 'Le trajet des aliments et le rôle des enzymes sont bien expliqués, schéma à l’appui.',
  },
  {
    daysAgo: 3,
    time: '19:10',
    subjectId: 'histoire-geo',
    chapterId: 'hg-empire',
    durationMinutes: 25,
    mode: 'flashcards',
    tools: [],
    outcome: 'understood',
    summary: '10 cartes révisées, 9 réussies. Les grandes dates de l’Empire sont connues.',
  },
  {
    daysAgo: 5,
    time: '18:00',
    subjectId: 'anglais',
    chapterId: 'en-comparatifs',
    durationMinutes: 45,
    mode: 'written',
    tools: [],
    outcome: 'understood',
    summary: 'Comparaison de villes : comparatifs et superlatifs utilisés sans erreur.',
  },
  {
    daysAgo: 6,
    time: '17:30',
    subjectId: 'maths',
    chapterId: 'maths-calcul-litteral',
    durationMinutes: 50,
    mode: 'written',
    tools: [],
    outcome: 'understood',
    summary: 'Développements et factorisations simples réussis du premier coup.',
  },
];

/** Heure de Paris « HH:MM » d'un jour donné, en UTC (Paris = UTC+2 en été, UTC+1 en hiver). */
function parisTimestamp(day: string, time: string): string {
  for (const offset of ['+02:00', '+01:00']) {
    const candidate = new Date(`${day}T${time}:00${offset}`);
    if (parisDay(candidate) === day) {
      const local = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Paris',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      }).format(candidate);
      if (local === time) return candidate.toISOString();
    }
  }
  return new Date(`${day}T${time}:00Z`).toISOString();
}

export function demoSessions(today: Date): ParentSession[] {
  const day = parisDay(today);
  return SESSIONS.map(({ daysAgo, time, ...session }, index) => ({
    ...session,
    id: `demo-session-${index + 1}`,
    startedAt: parisTimestamp(addDays(day, -daysAgo), time),
  }));
}

export function demoWeek(today: Date): ParentWeek {
  const end = parisDay(today);
  const start = addDays(end, -6);
  const sessions = demoSessions(today);
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const minutes = sessions
      .filter((s) => parisDay(new Date(s.startedAt)) === date)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    return { date, minutes };
  });
  const minutesBySubject: ParentWeek['minutesBySubject'] = {};
  for (const s of sessions) {
    minutesBySubject[s.subjectId] = (minutesBySubject[s.subjectId] ?? 0) + s.durationMinutes;
  }
  return {
    weekStart: start,
    days,
    previousMinutes: 242,
    previousActiveDays: 5,
    acquiredThisWeek: ['maths-equations', 'en-preterit', 'svt-digestion'],
    minutesBySubject,
    sessionHours: SESSIONS.map((s) => Number(s.time.slice(0, 2))),
    aiSummary: {
      text: 'Léa a travaillé **4 h 40** cette semaine, surtout en Maths et en Anglais, avec de beaux progrès sur les **équations du 1er degré**, résolues maintenant sans aide.',
      generatedAt: today.toISOString(),
    },
  };
}

/** Maîtrise par chapitre (P2) : valeurs de la maquette. */
export const demoChapters: readonly ChapterProgress[] = [
  { chapterId: 'maths-calcul-litteral', subjectId: 'maths', mastery: 0.88, sessions: 6 },
  { chapterId: 'maths-equations', subjectId: 'maths', mastery: 0.82, sessions: 5 },
  { chapterId: 'maths-pythagore', subjectId: 'maths', mastery: 0.61, sessions: 3 },
  { chapterId: 'maths-puissances', subjectId: 'maths', mastery: 0.48, sessions: 2 },
  { chapterId: 'maths-proportionnalite', subjectId: 'maths', mastery: null, sessions: 0 },
  { chapterId: 'en-preterit', subjectId: 'anglais', mastery: 0.92, sessions: 4 },
  { chapterId: 'en-comparatifs', subjectId: 'anglais', mastery: 0.85, sessions: 3 },
  { chapterId: 'en-voyage', subjectId: 'anglais', mastery: 0.7, sessions: 2 },
  { chapterId: 'en-present-perfect', subjectId: 'anglais', mastery: null, sessions: 0 },
  { chapterId: 'svt-digestion', subjectId: 'svt', mastery: 0.85, sessions: 3 },
  { chapterId: 'svt-reproduction', subjectId: 'svt', mastery: 0.64, sessions: 2 },
  { chapterId: 'svt-seismes-volcans', subjectId: 'svt', mastery: 0.58, sessions: 1 },
  { chapterId: 'svt-systeme-nerveux', subjectId: 'svt', mastery: null, sessions: 0 },
  { chapterId: 'fr-figures-de-style', subjectId: 'francais', mastery: 0.8, sessions: 3 },
  { chapterId: 'fr-recit-fantastique', subjectId: 'francais', mastery: 0.66, sessions: 2 },
  { chapterId: 'fr-participe-passe', subjectId: 'francais', mastery: 0.52, sessions: 4 },
  { chapterId: 'fr-subordonnees', subjectId: 'francais', mastery: null, sessions: 0 },
  { chapterId: 'hg-empire', subjectId: 'histoire-geo', mastery: 0.78, sessions: 3 },
  { chapterId: 'hg-revolution', subjectId: 'histoire-geo', mastery: 0.48, sessions: 3 },
  { chapterId: 'hg-urbanisation', subjectId: 'histoire-geo', mastery: 0.6, sessions: 1 },
  { chapterId: 'hg-mobilites', subjectId: 'histoire-geo', mastery: null, sessions: 0 },
  { chapterId: 'pc-atomes-molecules', subjectId: 'physique-chimie', mastery: 0.62, sessions: 2 },
  { chapterId: 'pc-masse-volumique', subjectId: 'physique-chimie', mastery: 0.41, sessions: 3 },
  { chapterId: 'pc-circuits', subjectId: 'physique-chimie', mastery: 0.55, sessions: 2 },
  { chapterId: 'pc-combustion', subjectId: 'physique-chimie', mastery: null, sessions: 0 },
];

/** Maîtrise en début de période, pour l'évolution (+12 pts en Maths sur le mois…). */
export const demoPreviousMastery: Record<'month' | 'quarter', Partial<Record<string, number>>> = {
  month: {
    'maths-calcul-litteral': 0.74,
    'maths-equations': 0.62,
    'maths-pythagore': 0.5,
    'maths-puissances': 0.48,
    'en-preterit': 0.86,
    'en-comparatifs': 0.78,
    'en-voyage': 0.66,
    'svt-digestion': 0.74,
    'svt-reproduction': 0.55,
    'svt-seismes-volcans': 0.5,
    'fr-figures-de-style': 0.76,
    'fr-recit-fantastique': 0.62,
    'fr-participe-passe': 0.48,
    'hg-empire': 0.7,
    'hg-revolution': 0.4,
    'hg-urbanisation': 0.55,
    'pc-atomes-molecules': 0.66,
    'pc-masse-volumique': 0.45,
    'pc-circuits': 0.56,
  },
  quarter: {
    'maths-calcul-litteral': 0.6,
    'maths-equations': 0.45,
    'maths-pythagore': 0.4,
    'maths-puissances': 0.35,
    'en-preterit': 0.75,
    'en-comparatifs': 0.7,
    'en-voyage': 0.55,
    'svt-digestion': 0.6,
    'svt-reproduction': 0.45,
    'svt-seismes-volcans': 0.4,
    'fr-figures-de-style': 0.65,
    'fr-recit-fantastique': 0.55,
    'fr-participe-passe': 0.4,
    'hg-empire': 0.6,
    'hg-revolution': 0.35,
    'hg-urbanisation': 0.45,
    'pc-atomes-molecules': 0.55,
    'pc-masse-volumique': 0.35,
    'pc-circuits': 0.45,
  },
};

/** Réglages de la maquette P4. */
export const demoSettings: ParentalSettings = {
  dailyLimitEnabled: true,
  dailyLimitMinutes: 90,
  allowedFrom: '17:00',
  allowedUntil: '21:00',
  eveningPause: true,
  voiceEnabled: true,
  cameraEnabled: false,
  visualsEnabled: true,
  weeklyGoalHours: 4,
};
