import {
  averagePerBucket,
  formatAxis,
  daysToBeatRecord,
  formatCount,
  formatCountDelta,
  formatDuration,
  formatDurationDelta,
  niceAxis,
  scaleBars,
} from './format';

describe('formatage des stats', () => {
  it('écrit les durées comme la maquette', () => {
    expect(formatDuration(35)).toBe('35 min');
    expect(formatDuration(65)).toBe('1 h 05');
    expect(formatDuration(280)).toBe('4 h 40');
    expect(formatDuration(720)).toBe('12 h');
    expect(formatDuration(2300)).toBe('38 h 20');
  });

  it('écrit les évolutions avec leur signe', () => {
    expect(formatDurationDelta(280 - 242)).toBe('+38 min');
    expect(formatDurationDelta(130)).toBe('+2 h 10');
    expect(formatDurationDelta(360)).toBe('+6 h');
    expect(formatCountDelta(3)).toBe('+3');
    expect(formatCountDelta(-12)).toBe('−12');
  });

  it('sépare les milliers par une espace insécable', () => {
    expect(formatCount(1642)).toBe('1 642');
    expect(formatCount(186)).toBe('186');
  });

  it('calcule les moyennes par jour, semaine et mois', () => {
    expect(formatDuration(averagePerBucket([35, 50, 20, 65, 40, 55, 15]))).toBe('40 min');
    expect(formatDuration(averagePerBucket([250, 235, 310, 275]))).toBe('4 h 28');
  });

  it('gradue l’axe avec des paliers ronds', () => {
    expect(niceAxis(65)).toEqual({ mid: 40, max: 80 });
    expect(niceAxis(310)).toEqual({ mid: 180, max: 360 });
    expect(niceAxis(1070)).toEqual({ mid: 600, max: 1200 });
  });

  it('écrit l’axe dans l’unité de son maximum', () => {
    expect(formatAxis(80, 80)).toBe('80 min');
    expect(formatAxis(40, 80)).toBe('40 min');
    expect(formatAxis(360, 360)).toBe('6 h');
    expect(formatAxis(600, 1200)).toBe('10 h');
  });

  it('met les barres à l’échelle de l’axe', () => {
    expect(scaleBars([40, 80, 0], 80, 139)).toEqual([70, 139, 0]);
  });

  it('compte les jours pour battre la série record', () => {
    expect(daysToBeatRecord(12, 15)).toBe(4);
    expect(daysToBeatRecord(16, 15)).toBe(0);
  });
});
