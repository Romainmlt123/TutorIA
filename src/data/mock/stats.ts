import type { Insight, MasteryPoint, PeriodKey, PeriodStats } from '../types';

/** Statistiques de Léa par période (04-Stats), en minutes pour les durées. */
export const periodStats: Record<PeriodKey, PeriodStats> = {
  week: {
    studyMinutes: { current: 280, previous: 242 },
    sessions: { current: 14, previous: 11 },
    cardsReviewed: { current: 186, previous: 162 },
    series: [
      { label: 'L', minutes: 35 },
      { label: 'M', minutes: 50 },
      { label: 'M', minutes: 20 },
      { label: 'J', minutes: 65 },
      { label: 'V', minutes: 40 },
      { label: 'S', minutes: 55 },
      { label: 'D', minutes: 15 },
    ],
  },
  month: {
    studyMinutes: { current: 1070, previous: 940 },
    sessions: { current: 52, previous: 44 },
    cardsReviewed: { current: 734, previous: 638 },
    series: [
      { label: '1–7', minutes: 250 },
      { label: '8–14', minutes: 235 },
      { label: '15–21', minutes: 310 },
      { label: '22–27', minutes: 275 },
    ],
  },
  quarter: {
    studyMinutes: { current: 2300, previous: 1940 },
    sessions: { current: 118, previous: 97 },
    cardsReviewed: { current: 1642, previous: 1332 },
    series: [
      { label: 'Juil.', minutes: 720 },
      { label: 'Août', minutes: 510 },
      { label: 'Sept.', minutes: 1070 },
    ],
  },
};

/** Maîtrise globale, une mesure par semaine sur 8 semaines. */
export const masteryHistory: readonly MasteryPoint[] = [
  { label: '3 août', percent: 42 },
  { label: '10 août', percent: 45 },
  { label: '17 août', percent: 51 },
  { label: '24 août', percent: 49 },
  { label: '31 août', percent: 56 },
  { label: '7 sept.', percent: 61 },
  { label: '14 sept.', percent: 64 },
  { label: '21 sept.', percent: 68 },
];

export const strengths: readonly Insight[] = [
  { notion: 'Le prétérit simple', chapterId: 'en-preterit', score: 0.92 },
  { notion: 'Calcul littéral', chapterId: 'maths-calcul-litteral', score: 0.88 },
  { notion: 'La digestion', chapterId: 'svt-digestion', score: 0.85 },
];

export const toWork: readonly Insight[] = [
  { notion: 'La masse volumique', chapterId: 'pc-masse-volumique', score: 0.41 },
  { notion: 'La Révolution : dates clés', chapterId: 'hg-revolution', score: 0.48 },
  { notion: 'Accord du participe passé', chapterId: 'fr-participe-passe', score: 0.52 },
];

/** Premier jour du calendrier d'activité (un lundi) : 13 semaines jusqu'au 27 septembre 2026. */
export const activityStart = new Date(2026, 5, 29);

/** Minutes représentatives de chaque niveau d'activité, du repos à la grosse journée. */
const MINUTES_BY_LEVEL = [0, 10, 25, 45, 75] as const;

/**
 * Minutes d'étude par jour sur 91 jours, générées de façon déterministe
 * (même tirage que la maquette 04-Stats, avec une série en cours sur les 12 derniers jours).
 */
export const dailyActivityMinutes: readonly number[] = Array.from({ length: 13 * 7 }, (_, i) => {
  const week = Math.floor(i / 7);
  const day = i % 7;
  const x = Math.sin(week * 12.9898 + day * 78.233) * 43758.5453;
  const r = x - Math.floor(x);
  let level = r < 0.22 ? 0 : r < 0.45 ? 1 : r < 0.7 ? 2 : r < 0.9 ? 3 : 4;
  if (week === 11 && day === 1) level = 0;
  if ((week === 11 && day >= 2) || week === 12) level = Math.max(level, 1);
  return MINUTES_BY_LEVEL[level] ?? 0;
});
