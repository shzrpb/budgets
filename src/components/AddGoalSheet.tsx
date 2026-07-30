"use client";

import { useState, useTransition } from "react";
import { upsertGoal } from "@/app/actions";
import Portal from "@/components/Portal";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import { useVisualViewportInsets } from "@/lib/useVisualViewport";
import type { Goal } from "@/lib/types";

export default function AddGoalSheet({
  goal,
  trigger,
  title,
  triggerClassName = "block w-full text-left",
}: {
  goal: Goal | null;
  trigger: React.ReactNode;
  title?: string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  useRegisterSheetOpen(open);
  const { height: viewportHeight, top: viewportTop } = useVisualViewportInsets();
  const [targetAmount, setTargetAmount] = useState(goal?.target_amount.toString() ?? "");
  const [targetDate, setTargetDate] = useState(goal?.target_date ?? "");
  const [isPending, startTransition] = useTransition();

  const canSave = Number(targetAmount) > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await upsertGoal({
        id: goal?.id,
        targetAmount: Number(targetAmount),
        targetDate: targetDate || null,
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
        <Portal>
        <div className="fixed inset-0 z-50 bg-black/40">
          <div
            className="fixed inset-x-0 flex items-center justify-center p-4"
            style={{ top: viewportTop, height: viewportHeight ?? "100dvh" }}
          >
            <div className="flex max-h-full w-full max-w-md flex-col overflow-x-hidden overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-xl">
              <p className="text-sm font-semibold text-stone-800">
                {title ?? (goal ? "Edit goal" : "Add a goal")}
              </p>

              <p className="mt-4 text-xs font-medium text-stone-400">Target amount</p>
              <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <span className="text-stone-400">$</span>
                <input
                  autoFocus
                  inputMode="decimal"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className="ml-1 w-full bg-transparent text-sm outline-none"
                />
              </div>

              <p className="mt-4 text-xs font-medium text-stone-400">Target date (optional)</p>
              <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 focus-within:border-stone-400">
                <input
                  type="date"
                  value={targetDate ?? ""}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                />
              </div>

              <div className="mt-5 grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="col-span-2 rounded-2xl bg-stone-100 py-3.5 text-sm font-medium text-stone-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSave || isPending}
                  onClick={handleSave}
                  className="col-span-3 rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
                >
                  {isPending ? "Saving…" : "Save goal"}
                </button>
              </div>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </>
  );
}
