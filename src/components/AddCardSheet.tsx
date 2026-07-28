"use client";

import { useState, useTransition } from "react";
import { addCard } from "@/app/actions";

const COLORS = ["#57534e", "#0ea5e9", "#22c55e", "#a855f7", "#f97316", "#ec4899"];

export default function AddCardSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [maxSpend, setMaxSpend] = useState("");
  const [note, setNote] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addCard({
        name: name.trim(),
        color,
        maxSpend: maxSpend === "" ? null : Number(maxSpend),
        note: note.trim() || null,
      });
      setOpen(false);
      setName("");
      setMaxSpend("");
      setNote("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
      >
        + Add card
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">Add card</p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-400">
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

            <p className="mt-4 text-xs font-medium text-stone-400">Color</p>
            <div className="mt-2 flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="h-7 w-7 rounded-full ring-2 ring-offset-2 transition-all"
                  style={{
                    backgroundColor: c,
                    outlineColor: c,
                    ["--tw-ring-color" as string]: color === c ? c : "transparent",
                  }}
                />
              ))}
            </div>

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
              {isPending ? "Saving…" : "Save card"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
