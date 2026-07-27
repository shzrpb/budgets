"use client";

import { useState, useTransition } from "react";
import { addCategory } from "@/app/actions";

const COLORS = ["#e8a87c", "#d8a7ca", "#b8a4d4", "#e3c16f", "#8fb8c9", "#7fc9b9", "#9bc99b", "#c9a88a"];

export default function AddCategorySheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addCategory({ name: name.trim(), color });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">New category</p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Subscriptions"
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <p className="mt-4 text-xs font-medium text-stone-400">Color</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full ring-2 ring-offset-2 transition-all"
              style={{
                backgroundColor: c,
                ["--tw-ring-color" as string]: color === c ? c : "transparent",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={!canSave || isPending}
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Add category"}
        </button>
      </div>
    </div>
  );
}
