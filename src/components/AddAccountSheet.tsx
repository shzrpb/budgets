"use client";

import { useState, useTransition } from "react";
import { addAccount } from "@/app/actions";
import type { AccountType } from "@/lib/types";

const TYPES: AccountType[] = ["checking", "savings", "investment", "cash", "credit", "other"];
const COLORS = ["#57534e", "#0ea5e9", "#22c55e", "#a855f7", "#f97316", "#ec4899"];

export default function AddAccountSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("checking");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0 && balance !== "";

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addAccount({ name: name.trim(), type, balance: Number(balance), color });
      setOpen(false);
      setName("");
      setBalance("");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
      >
        + Add account
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
          <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">Add account</p>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-stone-400">
                Cancel
              </button>
            </div>

            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Everyday checking"
              className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
            />

            <p className="mt-4 text-xs font-medium text-stone-400">Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                    type === t
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-700 ring-1 ring-inset ring-stone-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

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

            <p className="mt-4 text-xs font-medium text-stone-400">Starting balance</p>
            <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <span className="text-stone-400">$</span>
              <input
                inputMode="decimal"
                value={balance}
                onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0.00"
                className="ml-1 w-full bg-transparent text-sm outline-none"
              />
            </div>

            <button
              type="button"
              disabled={!canSave || isPending}
              onClick={handleSave}
              className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
            >
              {isPending ? "Saving…" : "Save account"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
