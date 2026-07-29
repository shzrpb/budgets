"use client";

import { useState, useTransition } from "react";
import { daysUntil, formatDueDate, nextDueDate } from "@/lib/cards";
import { payCardBill } from "@/app/actions";
import CategoryPill from "@/components/CategoryPill";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import type { Account, Card } from "@/lib/types";

const REMINDER_WINDOW_DAYS = 7;

function dueLabel(days: number): string {
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

export default function CardDueReminder({
  cards,
  accounts,
  cardOutstanding,
}: {
  cards: Card[];
  accounts: Account[];
  cardOutstanding: Record<string, number>;
}) {
  const [paying, setPaying] = useState<Card | null>(null);

  const now = new Date();
  const dueSoon = cards
    .filter((c): c is Card & { bill_due_day: number } => c.bill_due_day != null)
    .map((c) => {
      const due = nextDueDate(c.bill_due_day, now);
      return {
        card: c,
        due,
        days: daysUntil(due, now),
        outstanding: cardOutstanding[c.id] ?? 0,
      };
    })
    // Only nag about a bill that's actually due and still has something owed on it.
    .filter(({ days, outstanding }) => days >= 0 && days <= REMINDER_WINDOW_DAYS && outstanding > 0)
    .sort((a, b) => a.days - b.days);

  if (dueSoon.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {dueSoon.map(({ card, due, days, outstanding }) => (
        <div
          key={card.id}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-100 px-4 py-3"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-orange-600" />
          <div className="flex-1 text-xs text-orange-700">
            <p>
              <span className="font-medium">{card.name}</span> bill {dueLabel(days)}
            </p>
            <p className="font-mono text-orange-600/70">
              {formatDueDate(due)} · ${outstanding.toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaying(card)}
            className="shrink-0 rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold text-white"
          >
            Mark paid
          </button>
        </div>
      ))}

      {paying && (
        <PayBillSheet
          card={paying}
          amount={cardOutstanding[paying.id] ?? 0}
          accounts={accounts}
          onClose={() => setPaying(null)}
        />
      )}
    </div>
  );
}

function PayBillSheet({
  card,
  amount,
  accounts,
  onClose,
}: {
  card: Card;
  amount: number;
  accounts: Account[];
  onClose: () => void;
}) {
  useRegisterSheetOpen(true);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!accountId) return;
    startTransition(async () => {
      await payCardBill(card.id, accountId);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-stone-800">Pay {card.name} bill</p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <p className="mt-4 text-center font-mono text-3xl font-semibold tracking-tight">
          ${amount.toLocaleString()}
        </p>

        {accounts.length > 0 ? (
          <>
            <p className="mt-5 text-xs font-medium text-stone-400">Pay from</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {accounts.map((a) => (
                <CategoryPill
                  key={a.id}
                  name={a.name}
                  selected={accountId === a.id}
                  onClick={() => setAccountId(a.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="mt-5 text-center text-xs text-stone-400">
            Add an account first to pay this bill from.
          </p>
        )}

        <button
          type="button"
          disabled={!accountId || isPending}
          onClick={handleConfirm}
          className="mt-6 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
        >
          {isPending ? "Paying…" : "Confirm payment"}
        </button>
      </div>
    </div>
  );
}
