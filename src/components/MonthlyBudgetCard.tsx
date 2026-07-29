"use client";

import { useState, useTransition } from "react";
import { updateMonthlyBudget } from "@/app/actions";

function fmtAbs(n: number): string {
  return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function MonthlyBudgetCard({
  monthlyBudget,
  spent,
}: {
  monthlyBudget: number;
  spent: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(monthlyBudget.toString());
  const [isPending, startTransition] = useTransition();

  const progress = monthlyBudget > 0 ? Math.min(spent / monthlyBudget, 1) : 0;
  const nearLimit = monthlyBudget > 0 && spent / monthlyBudget >= 0.8;
  const remaining = monthlyBudget - spent;

  function save() {
    const value = Number(draft);
    if (Number.isNaN(value) || value < 0) {
      setEditing(false);
      return;
    }
    startTransition(() => updateMonthlyBudget(value));
    setEditing(false);
  }

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-800">Monthly budget</p>

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
              className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-right text-sm outline-none focus:border-stone-400"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(monthlyBudget.toString());
              setEditing(true);
            }}
            disabled={isPending}
            className="text-lg font-semibold tracking-tight text-stone-900"
          >
            ${monthlyBudget.toLocaleString()}
          </button>
        )}
      </div>

      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? "bg-amber-400" : "bg-stone-400"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-stone-400">
        <span className="font-mono">${fmtAbs(remaining)}</span> {remaining >= 0 ? "left" : "over"}
      </p>
    </div>
  );
}
