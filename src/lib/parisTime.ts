/**
 * Dates à l'heure de Paris, référence unique de l'app (jour d'une série, semaine, limite de temps).
 * La même règle est appliquée en base (private.paris_day). Les dates sont au format AAAA-MM-JJ.
 */
const TIME_ZONE = 'Europe/Paris';

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** Jour civil à Paris : 2026-09-27T23:30:00Z → « 2026-09-28 ». */
export function parisDay(date: Date): string {
  return dayFormat.format(date);
}

/** Heure et minute à Paris. */
export function parisTime(date: Date): { hour: number; minute: number } {
  const parts = timeFormat.formatToParts(date);
  const value = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { hour: value('hour') % 24, minute: value('minute') };
}

/** « 17:42 » */
export function formatClock(date: Date): string {
  const { hour, minute } = parisTime(date);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function toUtcNoon(day: string): Date {
  return new Date(`${day}T12:00:00Z`);
}

export function addDays(day: string, days: number): string {
  const date = toUtcNoon(day);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** 0 = lundi … 6 = dimanche. */
export function weekdayIndex(day: string): number {
  return (toUtcNoon(day).getUTCDay() + 6) % 7;
}

/** Lundi de la semaine d'un jour. */
export function mondayOf(day: string): string {
  return addDays(day, -weekdayIndex(day));
}

export function dayOfMonth(day: string): number {
  return Number(day.slice(8, 10));
}

/** 0 = janvier. */
export function monthIndex(day: string): number {
  return Number(day.slice(5, 7)) - 1;
}

/** Nombre de jours entre deux dates AAAA-MM-JJ (b − a). */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtcNoon(b).getTime() - toUtcNoon(a).getTime()) / 86_400_000);
}
