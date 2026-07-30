"use client";

import { useState, useTransition } from "react";
import { addCard, updateCard } from "@/app/actions";
import { PlusIcon } from "@/components/icons";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">
            {isEdit ? "Edit card" : "Add card"}
          </p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Amex KrisFlyer"
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <p className="mt-4 text-xs font-medium text-stone-400">
          Monthly spend limit <span className="text-stone-300">(optional)</span>
        </p>
        <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <span className="text-stone-400">$</span>
          <input
            inputMode="decimal"
            value={maxSpend}
            onChange={(e) => setMaxSpend(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="No limit"
            className="ml-1 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <p className="mt-4 text-xs font-medium text-stone-400">
          Bill due day <span className="text-stone-300">(optional)</span>
        </p>
        <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <input
            inputMode="numeric"
            value={billDueDay}
            onChange={(e) => setBillDueDay(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            placeholder="No reminder"
            className="w-full bg-transparent text-sm outline-none"
          />
          <span className="text-stone-400">day of month</span>
        </div>

        <p className="mt-4 text-xs font-medium text-stone-400">
          Note <span className="text-stone-300">(optional)</span>
        </p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. 5x miles on dining"
          maxLength={80}
          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <button
          type="button"
          disabled={!canSave || isPending}
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
        >
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Save card"}
        </button>
      </div>
    </div>
  );
}
