"use client";

import { useState, useTransition } from "react";
import { addCategory } from "@/app/actions";

export default function AddCategorySheet({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addCategory({ name: name.trim() });
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
