"use client";

import { useState, useTransition } from "react";
import { upsertGoal } from "@/app/actions";
import type { Goal, GoalKind } from "@/lib/types";

export default function AddGoalSheet({
  goal,
  trigger,
  kind = "custom",
  title,
  namePlaceholder = "e.g. Emergency fund",
  fixedName,
  triggerClassName = "block w-full text-left",
}: {
  goal: Goal | null;
  trigger: React.ReactNode;
  kind?: GoalKind;
  title?: string;
  namePlaceholder?: string;
  fixedName?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(goal?.name ?? fixedName ?? "");
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount.toString() ?? "");
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? "");
  const [isPending, startTransition] = useTransition();

  const canSave = (fixedName ?? name).trim().length > 0 && Number(targetAmount) > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await upsertGoal({
        id: goal?.id,
        name: (fixedName ?? name).trim(),
        targetAmount: Number(targetAmount),
        targetDate: targetDate || null,
        kind,
      });
      setOpen(false);
    });
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
      </button>

      {open && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">
                {title ?? (goal ? "Edit goal" : "Add a goal")}
              </p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-400">
                Cancel
              </button>
            </div>

            {!fixedName && (
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={namePlaceholder}
                className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
              />
            )}

            <p className="mt-4 text-xs font-medium text-stone-400">Target amount</p>
            <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <span className="text-stone-400">$</span>
              <input
                autoFocus={!!fixedName}
                inputMode="decimal"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="ml-1 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <p className="mt-4 text-xs font-medium text-stone-400">Target date (optional)</p>
            <input
              type="date"
              value={targetDate ?? ""}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
            />

            <button
              type="button"
              disabled={!canSave || isPending}
              onClick={handleSave}
              className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
            >
              {isPending ? "Saving…" : "Save goal"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
