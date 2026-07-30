"use client";

import { useState, useTransition } from "react";
import { addCard, updateCard } from "@/app/actions";
import Portal from "@/components/Portal";
import { PlusIcon } from "@/components/icons";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import { useVisualViewportInsets } from "@/lib/useVisualViewport";
import type { Card } from "@/lib/types";

/** Cards no longer expose a color picker; every card gets this neutral tint. */
const DEFAULT_COLOR = "#57534e";

export default function AddCardSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add card"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-stone-100"
      >
        <PlusIcon />
      </button>
      {open && <CardSheetForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditCardSheet({ card, onClose }: { card: Card; onClose: () => void }) {
  return <CardSheetForm card={card} onClose={onClose} />;
}

function CardSheetForm({ card, onClose }: { card?: Card; onClose: () => void }) {
  useRegisterSheetOpen(true);
  const { height: viewportHeight, top: viewportTop } = useVisualViewportInsets();
  const isEdit = !!card;
  const [name, setName] = useState(card?.name ?? "");
  const [maxSpend, setMaxSpend] = useState(card?.max_spend?.toString() ?? "");
  const [note, setNote] = useState(card?.note ?? "");
  const [billDueDay, setBillDueDay] = useState(card?.bill_due_day?.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      const input = {
        name: name.trim(),
        color: card?.color ?? DEFAULT_COLOR,
        maxSpend: maxSpend === "" ? null : Number(maxSpend),
        note: note.trim() || null,
        billDueDay: billDueDay === "" ? null : Math.min(31, Math.max(1, Number(billDueDay))),
      };
      if (isEdit) await updateCard(card!.id, input);
      else await addCard(input);
      onClose();
    });
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-50 bg-black/40">
      <div
        className="fixed inset-x-0 flex items-center justify-center p-4"
        style={{ top: viewportTop, height: viewportHeight ?? "100dvh" }}
      >
      <div className="flex max-h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-xl">
        <p className="text-sm font-semibold text-stone-800">
          {isEdit ? "Edit card" : "Add card"}
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amex KrisFlyer"
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-stone-400">Monthly spend limit</p>
            <div className="mt-2 flex h-11 items-center rounded-2xl border border-stone-200 bg-stone-50 px-4">
              <span className="text-stone-400">$</span>
              <input
                inputMode="decimal"
                value={maxSpend}
                onChange={(e) => setMaxSpend(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="No limit"
                className="ml-1 w-full min-w-0 bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-stone-400">Bill due date</p>
            <div className="mt-2 flex h-11 items-center rounded-2xl border border-stone-200 bg-stone-50 px-4">
              <input
                inputMode="numeric"
                value={billDueDay}
                onChange={(e) => setBillDueDay(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
                placeholder="No reminder"
                className="w-full min-w-0 bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-stone-400">Note</p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. 5x miles on dining"
          maxLength={80}
          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <div className="mt-5 grid grid-cols-5 gap-2">
          <button
            type="button"
            onClick={onClose}
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
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Save card"}
          </button>
        </div>
      </div>
      </div>
    </div>
    </Portal>
  );
}
