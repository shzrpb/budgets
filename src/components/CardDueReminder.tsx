"use client";

import { useEffect, useState } from "react";
import { daysUntil, formatDueDate, nextDueDate } from "@/lib/cards";
import type { Card } from "@/lib/types";

const REMINDER_WINDOW_DAYS = 7;
const DISMISSED_KEY = "dismissedBillAlerts";

function dueLabel(days: number): string {
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

function dismissKey(cardId: string, due: Date): string {
  return `${cardId}:${due.toISOString().slice(0, 10)}`;
}

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export default function CardDueReminder({ cards }: { cards: Card[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setDismissed(loadDismissed());
  }, []);

  const now = new Date();
  const dueSoon = cards
    .filter((c): c is Card & { bill_due_day: number } => c.bill_due_day != null)
    .map((c) => {
      const due = nextDueDate(c.bill_due_day, now);
      return { card: c, due, days: daysUntil(due, now), key: dismissKey(c.id, due) };
    })
    .filter(({ days, key }) => days >= 0 && days <= REMINDER_WINDOW_DAYS && !dismissed.has(key))
    .sort((a, b) => a.days - b.days);

  if (dueSoon.length === 0) return null;

  function markPaid(key: string) {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(key);
      try {
        window.localStorage.setItem(DISMISSED_KEY, JSON.stringify([...next]));
      } catch {
        // ignore storage failures (e.g. private browsing)
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {dueSoon.map(({ card, due, days, key }) => (
        <div
          key={card.id}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 px-4 py-3"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-600" />
          <p className="flex-1 text-xs text-orange-700">
            <span className="font-medium">{card.name}</span> bill {dueLabel(days)} ·{" "}
            {formatDueDate(due)}
          </p>
          <button
            type="button"
            onClick={() => markPaid(key)}
            className="shrink-0 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Paid
          </button>
        </div>
      ))}
    </div>
  );
}
