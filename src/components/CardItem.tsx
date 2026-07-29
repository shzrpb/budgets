"use client";

import { useState, useTransition } from "react";
import { deleteCard, updateCardMaxSpend } from "@/app/actions";
import { EditCardSheet } from "@/components/AddCardSheet";
import SwipeActions from "@/components/SwipeActions";
import { editDeleteActions } from "@/components/rowActions";
import type { Card } from "@/lib/types";

function ordinal(day: number): string {
  const suffix = ["th", "st", "nd", "rd"][day % 10 <= 3 && ![11, 12, 13].includes(day % 100) ? day % 10 : 0];
  return `${day}${suffix}`;
}

const TINTS = ["to-rose-50", "to-sky-50", "to-amber-50", "to-violet-50", "to-emerald-50"];

export default function CardItem({
  card,
  monthSpend,
  index = 0,
}: {
  card: Card;
  monthSpend: number;
  index?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState(card.max_spend?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  const over = card.max_spend != null && monthSpend > card.max_spend;
  const progress = card.max_spend ? Math.min(monthSpend / card.max_spend, 1) : 0;

  function save() {
    const value = draft === "" ? null : Number(draft);
    if (value !== null && Number.isNaN(value)) {
      setEditing(false);
      return;
    }
    startTransition(() => updateCardMaxSpend(card.id, value));
    setEditing(false);
  }

  return (
    <>
      <SwipeActions
        actions={editDeleteActions({
          onEdit: () => setSheetOpen(true),
          onDelete: () => startTransition(() => deleteCard(card.id)),
          editLabel: "Edit card",
          deleteLabel: "Delete card",
        })}
      >
        <div
          className={`rounded-3xl bg-gradient-to-br from-white ${TINTS[index % TINTS.length]} p-5 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-white/60`}
        >
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: card.color }} />
            <p className="text-sm font-medium text-stone-800">{card.name}</p>
          </div>

          {card.note && <p className="mt-2 text-xs text-stone-400">{card.note}</p>}
          {card.bill_due_day != null && (
            <p className="mt-1 text-xs text-stone-400">
              Bill due on the {ordinal(card.bill_due_day)}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-stone-500">
            <span>This month: ${monthSpend.toLocaleString()}</span>
            {editing ? (
              <div className="flex items-center gap-1">
                <span className="text-stone-400">$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
                  onBlur={save}
                  onKeyDown={(e) => e.key === "Enter" && save()}
                  placeholder="No limit"
                  className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-right text-sm outline-none focus:border-stone-400"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setDraft(card.max_spend?.toString() ?? "");
                  setEditing(true);
                }}
                disabled={isPending}
                className="font-medium text-stone-700"
              >
                {card.max_spend != null ? `Limit: $${card.max_spend.toLocaleString()}` : "Set limit"}
              </button>
            )}
          </div>

          {card.max_spend != null && (
            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full transition-all ${over ? "bg-red-400" : "bg-stone-800"}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}

          {over && (
            <p className="mt-2 text-xs font-medium text-red-500">
              ⚠ Over your ${card.max_spend!.toLocaleString()} limit this month
            </p>
          )}
        </div>
      </SwipeActions>

      {sheetOpen && <EditCardSheet card={card} onClose={() => setSheetOpen(false)} />}
    </>
  );
}
