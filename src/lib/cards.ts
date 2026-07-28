/**
 * A card's bill due date is stored as a day-of-month (1-31) since it recurs
 * every month. These helpers turn that into the next actual due date.
 */

/** Last valid day of the given month (1-indexed month, JS Date year). */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * The next occurrence of `day` on/after `from`, clamped to the end of any
 * shorter month (e.g. a due day of 31 lands on Feb 28/29 in February).
 */
export function nextDueDate(day: number, from: Date = new Date()): Date {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());

  const thisMonthDay = Math.min(day, daysInMonth(today.getFullYear(), today.getMonth()));
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), thisMonthDay);
  if (thisMonth >= today) return thisMonth;

  const nextMonthIndex = today.getMonth() + 1;
  const nextMonthDay = Math.min(day, daysInMonth(today.getFullYear(), nextMonthIndex));
  return new Date(today.getFullYear(), nextMonthIndex, nextMonthDay);
}

/** Whole days between today and `date` (0 = today, negative = past). */
export function daysUntil(date: Date, from: Date = new Date()): number {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

const DUE_DATE_LABEL = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });

export function formatDueDate(date: Date): string {
  return DUE_DATE_LABEL.format(date);
}
