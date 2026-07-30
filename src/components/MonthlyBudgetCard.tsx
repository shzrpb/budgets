"use client";

import { useState, useTransition } from "react";
import { updateMonthlyBudget } from "@/app/actions";
import { formatMoney } from "@/lib/format";

function fmtAbs(n: number): string {
  return formatMoney(Math.abs(n));
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
    <div className="hero p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--text-primary)]">Monthly budget</p>

        {editing ? (
          <div className="flex items-center gap-1">
            <span className="text-[var(--text-muted)]">$</span>
            <input
              autoFocus
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="w-24 rounded-lg border border-stone-200 bg-white px-2 py-1 text-right text-sm outline-none focus:border-stone-400"
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
            className="font-mono text-lg font-semibold tracking-tight text-[var(--text-primary)]"
          >
            ${formatMoney(monthlyBudget)}
          </button>
        )}
      </div>

      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: nearLimit ? "var(--text-warning)" : "var(--text-secondary)",
          }}
        />
      </div>
      <p className="mt-1.5 text-right text-xs text-[var(--text-muted)]">
        <span className="font-mono">${fmtAbs(remaining)}</span> {remaining >= 0 ? "left" : "over"}
      </p>
    </div>
  );
}
