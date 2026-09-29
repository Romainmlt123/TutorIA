import {
  addDays,
  daysBetween,
  formatClock,
  mondayOf,
  parisDay,
  parisTime,
  weekdayIndex,
} from './parisTime';

describe('Paris time', () => {
  it('uses the Paris calendar day, not the UTC one', () => {
    expect(parisDay(new Date('2026-09-27T21:30:00Z'))).toBe('2026-09-27');
    expect(parisDay(new Date('2026-09-27T22:30:00Z'))).toBe('2026-09-28');
  });

  it('follows the switch to winter time', () => {
    // 25 octobre 2026 : 3 h (été) redevient 2 h (hiver).
    expect(parisTime(new Date('2026-10-24T19:00:00Z'))).toEqual({ hour: 21, minute: 0 });
    expect(parisTime(new Date('2026-10-25T19:00:00Z'))).toEqual({ hour: 20, minute: 0 });
    expect(parisDay(new Date('2026-10-25T22:59:00Z'))).toBe('2026-10-25');
    expect(parisDay(new Date('2026-10-25T23:00:00Z'))).toBe('2026-10-26');
  });

  it('follows the switch to summer time', () => {
    // 29 mars 2026 : 2 h (hiver) devient 3 h (été).
    expect(formatClock(new Date('2026-03-28T16:42:00Z'))).toBe('17:42');
    expect(formatClock(new Date('2026-03-29T15:42:00Z'))).toBe('17:42');
  });

  it('computes weeks from Monday', () => {
    expect(weekdayIndex('2026-09-21')).toBe(0);
    expect(weekdayIndex('2026-09-27')).toBe(6);
    expect(mondayOf('2026-09-27')).toBe('2026-09-21');
    expect(addDays('2026-09-28', -1)).toBe('2026-09-27');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(daysBetween('2026-09-21', '2026-09-28')).toBe(7);
  });
});
