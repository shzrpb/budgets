"use client";

import { useState, useTransition } from "react";
import { deleteCard, updateCardMaxSpend } from "@/app/actions";
import type { Card } from "@/lib/types";

export default function CardItem({
  card,
  monthSpend,
}: {
  card: Card;
  monthSpend: number;
}) {
  const [editing, setEditing] = useState(false);
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
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: card.color }} />
          <p className="text-sm font-medium text-stone-800">{card.name}</p>
        </div>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteCard(card.id))}
          className="text-stone-300 transition-colors hover:text-red-400"
          aria-label="Delete card"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      </div>

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
  );
}
