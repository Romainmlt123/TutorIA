const DAY_MS = 86_400_000;
const MONTHS = [
  'Janv.',
  'Févr.',
  'Mars',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sept.',
  'Oct.',
  'Nov.',
  'Déc.',
];

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

/** Niveau de couleur d'une journée selon les minutes étudiées (5 niveaux). */
export function heatmapLevel(minutes: number): HeatmapLevel {
  if (minutes <= 0) return 0;
  if (minutes <= 15) return 1;
  if (minutes <= 35) return 2;
  if (minutes <= 60) return 3;
  return 4;
}

export type HeatmapDay = { date: Date; minutes: number; level: HeatmapLevel };

export type Heatmap = {
  /** Une colonne par semaine, du lundi au dimanche. */
  weeks: HeatmapDay[][];
  activeDays: number;
  totalDays: number;
  /** Mois affichés au-dessus des colonnes : semaine où le mois occupe la majorité des jours. */
  months: { label: string; week: number }[];
};

/** Construit le calendrier d'activité à partir d'un lundi et des minutes de chaque jour. */
export function buildHeatmap(start: Date, dailyMinutes: readonly number[]): Heatmap {
  const days: HeatmapDay[] = dailyMinutes.map((minutes, i) => ({
    date: new Date(start.getTime() + i * DAY_MS),
    minutes,
    level: heatmapLevel(minutes),
  }));
  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const months: Heatmap['months'] = [];
  weeks.forEach((week, index) => {
    const counts = new Map<number, number>();
    for (const day of week)
      counts.set(day.date.getMonth(), (counts.get(day.date.getMonth()) ?? 0) + 1);
    const [month] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];
    if (month !== undefined && !months.some((m) => m.label === MONTHS[month])) {
      months.push({ label: MONTHS[month] ?? '', week: index });
    }
  });

  return {
    weeks,
    activeDays: days.filter((d) => d.level > 0).length,
    totalDays: days.length,
    months,
  };
}
