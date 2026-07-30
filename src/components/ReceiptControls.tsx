"use client";

import { useState, useTransition } from "react";
import { addCategory } from "@/app/actions";
import CategoryPill from "@/components/CategoryPill";
import Portal from "@/components/Portal";
import { ChevronDownIcon } from "@/components/icons";

export type SelectOption = { id: string; name: string };

export function Dashes() {
  return <div className="my-4 border-t-2 border-dashed border-stone-300" />;
}

/** Popup: pick from chips, tap to select + auto-close. Category flow also supports "+ New". */
export function SelectPopup({
  title,
  options,
  selectedId,
  onSelect,
  onClose,
  allowNew,
  newCategoryIsFixed,
}: {
  title: string;
  options: SelectOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  allowNew?: boolean;
  /** New categories created here go into the fixed-transaction picker instead of the daily one. */
  newCategoryIsFixed?: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      await addCategory({ name, isFixed: newCategoryIsFixed });
      onClose();
    });
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div
        className="w-full max-w-xs rounded-3xl bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {creating ? (
          <>
            <p className="text-sm font-semibold text-stone-800">New category</p>
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Subscriptions"
              className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="flex-1 rounded-2xl bg-stone-100 py-3 text-sm font-medium text-stone-600"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!newName.trim() || isPending}
                onClick={handleCreate}
                className="flex-1 rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white disabled:opacity-40"
              >
                {isPending ? "Adding…" : "Done"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-stone-800">{title}</p>
              <button type="button" onClick={onClose} className="text-sm text-stone-400">
                Close
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {options.map((o) => (
                <CategoryPill
                  key={o.id}
                  name={o.name}
                  selected={selectedId === o.id}
                  onClick={() => {
                    onSelect(o.id);
                    onClose();
                  }}
                />
              ))}
              {allowNew && (
                <button
                  type="button"
                  onClick={() => setCreating(true)}
                  className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-500"
                >
                  + New
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
    </Portal>
  );
}

export function SelectRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between">
      <p className="text-xs font-medium text-stone-400">{label}</p>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-800"
      >
        {value}
        <ChevronDownIcon size={13} />
      </button>
    </div>
  );
}
