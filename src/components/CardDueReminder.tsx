import { daysUntil, formatDueDate, nextDueDate } from "@/lib/cards";
import type { Card } from "@/lib/types";

const REMINDER_WINDOW_DAYS = 7;

function dueLabel(days: number): string {
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

export default function CardDueReminder({ cards }: { cards: Card[] }) {
  const now = new Date();
  const dueSoon = cards
    .filter((c): c is Card & { bill_due_day: number } => c.bill_due_day != null)
    .map((c) => {
      const due = nextDueDate(c.bill_due_day, now);
      return { card: c, due, days: daysUntil(due, now) };
    })
    .filter(({ days }) => days >= 0 && days <= REMINDER_WINDOW_DAYS)
    .sort((a, b) => a.days - b.days);

  if (dueSoon.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {dueSoon.map(({ card, due, days }) => (
        <div
          key={card.id}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 px-4 py-3"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-600" />
          <p className="text-xs text-orange-700">
            <span className="font-medium">{card.name}</span> bill {dueLabel(days)} ·{" "}
            {formatDueDate(due)}
          </p>
        </div>
      ))}
    </div>
  );
}
