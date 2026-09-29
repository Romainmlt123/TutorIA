/**
 * Comptes de démonstration : Léa (4e, reliée à sa maman), Claire (parent) et Hugo (5e, sans onboarding).
 * Usage :
 *   npm run db:seed                          Supabase local (npm run db:start)
 *   npm run db:seed -- --remote              projet en ligne, avec SEED_ALLOW_PROJECT=<ref du projet>
 * Ne tourne jamais en production. Les comptes existants de démonstration sont recréés.
 */
import { execFileSync } from 'node:child_process';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '../src/services/db/database.types.ts';

type Admin = SupabaseClient<Database>;

const LOCAL_DEMO_PASSWORD = 'Tutoria2026';

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function target(): { url: string; secretKey: string; password: string } {
  if (process.env.NODE_ENV === 'production') fail('Seed refusé : NODE_ENV=production.');

  if (!process.argv.includes('--remote')) {
    const status = JSON.parse(
      execFileSync('npx', ['supabase', 'status', '-o', 'json'], { encoding: 'utf8' }),
    ) as { API_URL?: string; SECRET_KEY?: string };
    if (!status.API_URL || !status.SECRET_KEY)
      fail('Supabase local est arrêté : npm run db:start.');
    return {
      url: status.API_URL,
      secretKey: status.SECRET_KEY,
      password: process.env.SEED_DEMO_PASSWORD ?? LOCAL_DEMO_PASSWORD,
    };
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  const password = process.env.SEED_DEMO_PASSWORD;
  const allowed = process.env.SEED_ALLOW_PROJECT;
  if (!url || !secretKey || !password) {
    fail('Variables requises : EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, SEED_DEMO_PASSWORD.');
  }
  const ref = new URL(url).hostname.split('.')[0];
  if (!allowed || allowed !== ref) fail(`Seed refusé : SEED_ALLOW_PROJECT doit valoir « ${ref} ».`);
  return { url, secretKey, password };
}

async function check<R extends { data: unknown; error: unknown }>(
  label: string,
  run: PromiseLike<R>,
): Promise<R['data']> {
  const { data, error } = await run;
  if (error) fail(`${label} : ${error instanceof Error ? error.message : JSON.stringify(error)}`);
  return data;
}

async function recreateUser(
  admin: Admin,
  email: string,
  password: string,
  metadata: Record<string, unknown>,
): Promise<string> {
  const existing = await check('recherche', admin.rpc('find_account_by_email', { p_email: email }));
  for (const account of existing ?? []) {
    await check('suppression', admin.auth.admin.deleteUser(account.id));
  }
  const { user } = await check(
    `création de ${email}`,
    admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: metadata }),
  );
  if (!user) fail(`création de ${email} : aucun utilisateur renvoyé`);
  return user.id;
}

// ---------------------------------------------------------------------------
// Activité de Léa : 13 semaines de révisions, la semaine des maquettes P1 à P3.
// ---------------------------------------------------------------------------

type Subject = Database['public']['Enums']['subject_id'];
type Mode = Database['public']['Enums']['session_mode'];

const PARIS_OFFSET = '+02:00';

function parisDayOf(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(date);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Même tirage déterministe que les données simulées de l'app (04-Stats). */
function minutesOfDay(index: number): number {
  const week = Math.floor(index / 7);
  const day = index % 7;
  const x = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
  const r = x - Math.floor(x);
  const level = r < 0.22 ? 0 : r < 0.45 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4;
  return [0, 10, 25, 45, 75][level] ?? 0;
}

const ROTATION: readonly [Subject, string][] = [
  ['maths', 'maths-calcul-litteral'],
  ['anglais', 'en-preterit'],
  ['svt', 'svt-digestion'],
  ['francais', 'fr-figures-de-style'],
  ['histoire-geo', 'hg-empire'],
  ['physique-chimie', 'pc-atomes-molecules'],
];

type SessionSeed = {
  daysAgo: number;
  time: string;
  subject: Subject;
  chapter: string;
  minutes: number;
  mode: Mode;
  tools?: ('graph' | 'whiteboard')[];
  outcome?: 'understood' | 'progressing' | 'to_review';
  understood?: string;
  toReview?: string;
  cards?: [answered: number, correct: number];
};

/** La semaine des maquettes (P3) : 9 sessions, 4 h 40, 6 jours actifs. */
const WEEK: readonly SessionSeed[] = [
  {
    daysAgo: 0,
    time: '17:42',
    subject: 'maths',
    chapter: 'maths-equations',
    minutes: 45,
    mode: 'written',
    tools: ['whiteboard'],
    outcome: 'understood',
    understood: 'résoudre 3x + 5 = 20 sans aide',
    toReview: undefined,
  },
  {
    daysAgo: 0,
    time: '10:15',
    subject: 'anglais',
    chapter: 'en-preterit',
    minutes: 10,
    mode: 'voice',
  },
  {
    daysAgo: 1,
    time: '18:05',
    subject: 'physique-chimie',
    chapter: 'pc-masse-volumique',
    minutes: 30,
    mode: 'written',
    tools: ['graph'],
    outcome: 'to_review',
    understood: 'la formule de la masse volumique',
    toReview: 'les conversions d’unités (g/cm³ en kg/m³)',
  },
  {
    daysAgo: 2,
    time: '17:10',
    subject: 'maths',
    chapter: 'maths-pythagore',
    minutes: 10,
    mode: 'voice',
  },
  {
    daysAgo: 3,
    time: '17:20',
    subject: 'francais',
    chapter: 'fr-participe-passe',
    minutes: 30,
    mode: 'flashcards',
    cards: [12, 8],
  },
  {
    daysAgo: 3,
    time: '18:30',
    subject: 'svt',
    chapter: 'svt-digestion',
    minutes: 35,
    mode: 'written',
    outcome: 'understood',
    understood: 'le trajet des aliments et le rôle des enzymes',
  },
  {
    daysAgo: 3,
    time: '19:10',
    subject: 'histoire-geo',
    chapter: 'hg-empire',
    minutes: 25,
    mode: 'flashcards',
    cards: [10, 9],
  },
  {
    daysAgo: 5,
    time: '18:00',
    subject: 'anglais',
    chapter: 'en-comparatifs',
    minutes: 45,
    mode: 'written',
    outcome: 'understood',
    understood: 'les comparatifs et les superlatifs',
  },
  {
    daysAgo: 6,
    time: '17:30',
    subject: 'maths',
    chapter: 'maths-calcul-litteral',
    minutes: 50,
    mode: 'written',
    outcome: 'understood',
    understood: 'développer et factoriser des expressions simples',
  },
];

/** Maîtrise par chapitre (P2) : [chapitre, matière, maîtrise, séances, il y a un mois, il y a trois mois]. */
const CHAPTERS: readonly [string, Subject, number, number, number, number][] = [
  ['maths-calcul-litteral', 'maths', 0.88, 6, 0.74, 0.6],
  ['maths-equations', 'maths', 0.82, 5, 0.62, 0.45],
  ['maths-pythagore', 'maths', 0.61, 3, 0.5, 0.4],
  ['maths-puissances', 'maths', 0.48, 2, 0.48, 0.35],
  ['en-preterit', 'anglais', 0.92, 4, 0.86, 0.75],
  ['en-comparatifs', 'anglais', 0.85, 3, 0.78, 0.7],
  ['en-voyage', 'anglais', 0.7, 2, 0.66, 0.55],
  ['svt-digestion', 'svt', 0.85, 3, 0.74, 0.6],
  ['svt-reproduction', 'svt', 0.64, 2, 0.55, 0.45],
  ['svt-seismes-volcans', 'svt', 0.58, 1, 0.5, 0.4],
  ['fr-figures-de-style', 'francais', 0.8, 3, 0.76, 0.65],
  ['fr-recit-fantastique', 'francais', 0.66, 2, 0.62, 0.55],
  ['fr-participe-passe', 'francais', 0.52, 4, 0.48, 0.4],
  ['hg-empire', 'histoire-geo', 0.78, 3, 0.7, 0.6],
  ['hg-revolution', 'histoire-geo', 0.48, 3, 0.4, 0.35],
  ['hg-urbanisation', 'histoire-geo', 0.6, 1, 0.55, 0.45],
  ['pc-atomes-molecules', 'physique-chimie', 0.62, 2, 0.66, 0.55],
  ['pc-masse-volumique', 'physique-chimie', 0.41, 3, 0.45, 0.35],
  ['pc-circuits', 'physique-chimie', 0.55, 2, 0.56, 0.45],
];

function monthStart(day: string, offset: number): string {
  const date = new Date(`${day.slice(0, 7)}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 10);
}

async function insertSession(
  admin: Admin,
  studentId: string,
  day: string,
  seed: Omit<SessionSeed, 'daysAgo'>,
) {
  const startedAt = new Date(`${day}T${seed.time}:00${PARIS_OFFSET}`);
  const endedAt = new Date(startedAt.getTime() + seed.minutes * 60_000);
  const created = await check(
    'séance',
    admin
      .from('study_sessions')
      .insert({
        student_id: studentId,
        mode: seed.mode,
        subject_id: seed.subject,
        chapter_id: seed.chapter,
        started_at: startedAt.toISOString(),
        tools: seed.tools ?? [],
        outcome: seed.outcome ?? null,
        summary_understood: seed.understood ?? null,
        summary_to_review: seed.toReview ?? null,
      })
      .select('id, xp')
      .single(),
  );
  if (!created) fail('séance : aucune ligne créée');
  // Les déclencheurs reportent durée, cartes et XP dans l'agrégat du jour et la progression.
  const [answered, correct] = seed.cards ?? [0, 0];
  await check(
    'durée de séance',
    admin
      .from('study_sessions')
      .update({
        ended_at: endedAt.toISOString(),
        duration_seconds: Math.min(seed.mode === 'voice' ? 600 : 3600, seed.minutes * 60),
        cards_answered: answered,
        cards_correct: correct,
        xp: created.xp + answered * 5,
      })
      .eq('id', created.id),
  );
}

async function seedActivity(admin: Admin, studentId: string) {
  const today = parisDayOf(new Date());
  // 13 semaines passées (avant la semaine des maquettes) : une séance de flashcards par jour actif.
  for (let daysAgo = 90; daysAgo >= 7; daysAgo -= 1) {
    const minutes = minutesOfDay(90 - daysAgo);
    if (minutes === 0) continue;
    const [subject, chapter] = ROTATION[daysAgo % ROTATION.length] ?? ROTATION[0]!;
    const cards = Math.max(4, Math.round(minutes / 2));
    await insertSession(admin, studentId, addDays(today, -daysAgo), {
      time: '17:30',
      subject,
      chapter,
      minutes,
      mode: 'flashcards',
      cards: [cards, Math.round(cards * 0.75)],
    });
  }
  for (const { daysAgo, ...session } of WEEK) {
    await insertSession(admin, studentId, addDays(today, -daysAgo), session);
  }

  // Maîtrise des chapitres et photos mensuelles (P2), XP et série (Accueil).
  await check(
    'progression des chapitres',
    admin.from('chapter_progress').upsert(
      CHAPTERS.map(([chapter, subject, mastery, sessions]) => ({
        student_id: studentId,
        chapter_id: chapter,
        subject_id: subject,
        mastery,
        sessions,
      })),
    ),
  );
  const snapshots = CHAPTERS.flatMap(([chapter, , mastery, , monthAgo, quarterAgo]) => [
    { student_id: studentId, chapter_id: chapter, month: monthStart(today, 0), mastery },
    { student_id: studentId, chapter_id: chapter, month: monthStart(today, -1), mastery: monthAgo },
    {
      student_id: studentId,
      chapter_id: chapter,
      month: monthStart(today, -2),
      mastery: (monthAgo + quarterAgo) / 2,
    },
    {
      student_id: studentId,
      chapter_id: chapter,
      month: monthStart(today, -3),
      mastery: quarterAgo,
    },
  ]);
  await check('photos mensuelles', admin.from('chapter_progress_monthly').upsert(snapshots));
  await check(
    'XP et série',
    admin
      .from('student_progress')
      .update({ xp: 3340, streak_days: 12, record_streak: 15, last_active_day: today })
      .eq('student_id', studentId),
  );

  // Cartes à revoir aujourd'hui (révision du jour).
  const due = [
    'maths-equations-03',
    'maths-puissances-02',
    'hg-revolution-01',
    'hg-revolution-02',
    'en-voyage-01',
    'fr-participe-passe-02',
    'svt-reproduction-01',
    'pc-masse-volumique-01',
  ];
  await check(
    'cartes à revoir',
    admin.from('flashcard_states').upsert(
      due.map((card) => {
        const chapter = card.replace(/-\d+$/, '');
        const subject = CHAPTERS.find(([id]) => id === chapter)?.[1] ?? 'maths';
        return {
          student_id: studentId,
          card_id: card,
          chapter_id: chapter,
          subject_id: subject,
          state: 'to_review' as const,
          box: 1,
          due_on: today,
        };
      }),
    ),
  );

  // Résumé de la semaine (P1), produit à partir des agrégats.
  await check(
    'résumé de la semaine',
    admin.from('weekly_reports').upsert({
      student_id: studentId,
      week_start: addDays(today, -6),
      summary:
        'Léa a travaillé **4 h 40** cette semaine, surtout en Maths et en Anglais, avec de beaux progrès sur les **équations du 1er degré**, résolues maintenant sans aide.',
    }),
  );
}

async function seed() {
  const { url, secretKey, password } = target();
  const admin: Admin = createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const claire = await recreateUser(admin, 'claire@tutoria.test', password, {
    role: 'parent',
    first_name: 'Claire',
    terms_accepted: true,
    weekly_report: true,
  });
  const lea = await recreateUser(admin, 'lea@tutoria.test', password, {
    role: 'student',
    first_name: 'Léa',
    under_15: true,
  });
  await recreateUser(admin, 'hugo@tutoria.test', password, {
    role: 'student',
    first_name: 'Hugo',
    under_15: true,
  });

  // Léa : onboarding terminé (réponses des maquettes O1 à O4), reliée à Claire par un code.
  await check(
    'onboarding de Léa',
    admin
      .from('students')
      .update({
        grade: '4e',
        daily_minutes: 20,
        goals: ['raise_grades', 'understand'],
        modes: ['written', 'voice', 'visual'],
        moments: ['after_school', 'weekend'],
        reminder_enabled: true,
        onboarding_completed_at: new Date().toISOString(),
        consent_status: 'granted',
      })
      .eq('id', lea),
  );
  await check(
    'auto-évaluation de Léa',
    admin.from('self_assessments').insert([
      { student_id: lea, subject_id: 'physique-chimie', level: 'struggling' },
      { student_id: lea, subject_id: 'maths', level: 'meh' },
      { student_id: lea, subject_id: 'francais', level: 'ok' },
      { student_id: lea, subject_id: 'anglais', level: 'confident' },
      { student_id: lea, subject_id: 'svt', level: 'ok' },
      { student_id: lea, subject_id: 'histoire-geo', level: 'ok' },
    ]),
  );
  await check(
    'lien Claire-Léa',
    admin.from('parent_links').insert({ parent_id: claire, student_id: lea, origin: 'link_code' }),
  );
  await check(
    'consentement',
    admin
      .from('parental_consents')
      .insert({ student_id: lea, parent_id: claire, method: 'link_code' }),
  );
  // Réglages de la maquette P4.
  await check(
    'réglages de Léa',
    admin
      .from('parental_settings')
      .update({
        daily_limit_enabled: true,
        evening_pause: true,
        camera_enabled: false,
        weekly_goal_hours: 4,
        updated_by: claire,
      })
      .eq('student_id', lea),
  );

  await seedActivity(admin, lea);

  process.stdout.write(
    'Comptes de démonstration prêts : lea@tutoria.test, claire@tutoria.test, hugo@tutoria.test\n',
  );
}

seed().catch((error: unknown) => fail(error instanceof Error ? error.message : String(error)));
