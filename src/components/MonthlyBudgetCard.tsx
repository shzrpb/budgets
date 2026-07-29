"use client";

import { useState, useTransition } from "react";
import { updateMonthlyBudget } from "@/app/actions";

export default function MonthlyBudgetCard({ monthlyBudget }: { monthlyBudget: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(monthlyBudget.toString());
  const [isPending, startTransition] = useTransition();

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
    <div className="flex items-center justify-between rounded-3xl bg-gradient-to-br from-white to-sky-50 p-5 shadow-sm">
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
  );
}
