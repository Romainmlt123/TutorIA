import { fr } from '@/i18n/fr';
import { addDays, dayOfMonth, monthIndex, weekdayIndex } from '@/lib/parisTime';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** « du 21 au 27 septembre », « du 28 septembre au 4 octobre ». */
export function weekRangeLabel(weekStart: string): string {
  const end = addDays(weekStart, 6);
  const sameMonth = monthIndex(weekStart) === monthIndex(end);
  const from = sameMonth
    ? String(dayOfMonth(weekStart))
    : `${dayOfMonth(weekStart)} ${fr.dates.months[monthIndex(weekStart)]}`;
  return `du ${from} au ${dayOfMonth(end)} ${fr.dates.months[monthIndex(end)]}`;
}

/** « Aujourd’hui », « Hier », sinon « Jeudi 24 septembre ». */
export function dayLabel(day: string, today: string): string {
  if (day === today) return fr.dates.today;
  if (day === addDays(today, -1)) return fr.dates.yesterday;
  const weekday = fr.dates.weekdays[weekdayIndex(day)] ?? '';
  return `${capitalize(weekday)} ${dayOfMonth(day)} ${fr.dates.months[monthIndex(day)]}`;
}

/** « dimanche 27 sept. » (date d'un résumé). */
export function shortDateLabel(day: string): string {
  const month = fr.dates.monthsShort[monthIndex(day)] ?? '';
  return `${fr.dates.weekdays[weekdayIndex(day)]} ${dayOfMonth(day)} ${month}`;
}
