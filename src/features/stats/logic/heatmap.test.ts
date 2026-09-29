import { activityStart, dailyActivityMinutes } from '@/data/mock/stats';

import { buildHeatmap, heatmapLevel } from './heatmap';

describe('calendrier d’activité', () => {
  it('répartit les minutes en 5 niveaux', () => {
    expect([0, 10, 25, 45, 75].map(heatmapLevel)).toEqual([0, 1, 2, 3, 4]);
  });

  it('forme 13 semaines de 7 jours et compte les jours actifs', () => {
    const heatmap = buildHeatmap(activityStart, dailyActivityMinutes);
    expect(heatmap.weeks).toHaveLength(13);
    expect(heatmap.weeks.every((w) => w.length === 7)).toBe(true);
    expect(heatmap.totalDays).toBe(91);
    expect(heatmap.activeDays).toBe(dailyActivityMinutes.filter((m) => m > 0).length);
  });

  it('place les mois au-dessus de la semaine où ils dominent', () => {
    const { months } = buildHeatmap(activityStart, dailyActivityMinutes);
    expect(months).toEqual([
      { label: 'Juil.', week: 0 },
      { label: 'Août', week: 5 },
      { label: 'Sept.', week: 9 },
    ]);
  });

  it('garde une série en cours sur les derniers jours', () => {
    const last12 = dailyActivityMinutes.slice(-12);
    expect(last12.every((m) => m > 0)).toBe(true);
  });
});
