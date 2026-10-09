import { secondsUntilBlock, studyBlock } from './studyRules';

const open = {
  eveningPause: false,
  dailyLimitEnabled: false,
  dailyLimitMinutes: 90,
  allowedFrom: '17:00',
  allowedUntil: '21:00',
};

describe('studyBlock', () => {
  it('lets the student work without parental rules', () => {
    expect(studyBlock(open, 99_999, new Date('2026-09-28T21:30:00Z'))).toBeNull();
  });

  it('pauses after 21 h, Paris time, until the morning', () => {
    const rules = { ...open, eveningPause: true };
    // 28 septembre (été, UTC+2) : 20:59 et 21:00 à Paris.
    expect(studyBlock(rules, 0, new Date('2026-09-28T18:59:00Z'))).toBeNull();
    expect(studyBlock(rules, 0, new Date('2026-09-28T19:00:00Z'))).toBe('evening_pause');
    expect(studyBlock(rules, 0, new Date('2026-09-29T03:30:00Z'))).toBe('evening_pause');
    expect(studyBlock(rules, 0, new Date('2026-09-29T04:00:00Z'))).toBeNull();
  });

  it('follows the winter time change', () => {
    const rules = { ...open, eveningPause: true };
    // 26 octobre (hiver, UTC+1) : 19:30 UTC = 20:30 à Paris.
    expect(studyBlock(rules, 0, new Date('2026-10-26T19:30:00Z'))).toBeNull();
    expect(studyBlock(rules, 0, new Date('2026-10-26T20:00:00Z'))).toBe('evening_pause');
  });

  it('keeps the student inside the allowed window', () => {
    const rules = { ...open, dailyLimitEnabled: true };
    expect(studyBlock(rules, 0, new Date('2026-09-28T14:59:00Z'))).toBe('outside_window');
    expect(studyBlock(rules, 0, new Date('2026-09-28T15:00:00Z'))).toBeNull();
    expect(studyBlock(rules, 0, new Date('2026-09-28T19:00:00Z'))).toBe('outside_window');
  });

  it('stops once the daily time is used', () => {
    const rules = { ...open, dailyLimitEnabled: true };
    const at17h30 = new Date('2026-09-28T15:30:00Z');
    expect(studyBlock(rules, 89 * 60, at17h30)).toBeNull();
    expect(studyBlock(rules, 90 * 60, at17h30)).toBe('daily_limit');
  });
});

describe('secondsUntilBlock', () => {
  it('has no bound without parental rules', () => {
    expect(secondsUntilBlock(open, 0, new Date('2026-09-28T18:00:00Z'))).toBeNull();
  });

  it('counts down to the evening pause, Paris time', () => {
    const rules = { ...open, eveningPause: true };
    // 20:55:30 à Paris (été, UTC+2) : 4 min 30 s avant 21 h.
    expect(secondsUntilBlock(rules, 0, new Date('2026-09-28T18:55:30Z'))).toBe(270);
  });

  it('keeps the closest of the window end and the daily time left', () => {
    const rules = { ...open, dailyLimitEnabled: true, dailyLimitMinutes: 30 };
    // 18:00 à Paris : 3 h avant 21 h, mais 5 min de temps restant.
    expect(secondsUntilBlock(rules, 25 * 60, new Date('2026-09-28T16:00:00Z'))).toBe(300);
    expect(secondsUntilBlock(rules, 40 * 60, new Date('2026-09-28T16:00:00Z'))).toBe(0);
  });
});
