"use client";

import { useState, useTransition } from "react";
import { addCategory, deleteCategory, updateCategory } from "@/app/actions";
import type { Category } from "@/lib/types";

const CONFIRM_TIMEOUT_MS = 3000;

export default function AddCategorySheet({ onClose }: { onClose: () => void }) {
  return <CategorySheetForm onClose={onClose} />;
}

/** Opened by a long press on a category pill; lets you rename or delete it. */
export function EditCategorySheet({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  return <CategorySheetForm category={category} onClose={onClose} />;
}

function CategorySheetForm({ category, onClose }: { category?: Category; onClose: () => void }) {
  const isEdit = !!category;
  const [name, setName] = useState(category?.name ?? "");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      if (isEdit) await updateCategory(category!.id, { name: name.trim() });
      else await addCategory({ name: name.trim() });
      onClose();
    });
  }

  function handleDeleteClick() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      setTimeout(() => setConfirmingDelete(false), CONFIRM_TIMEOUT_MS);
      return;
    }
    if (!category) return;
    startTransition(async () => {
      await deleteCategory(category.id);
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">
            {isEdit ? "Edit category" : "New category"}
          </p>
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
          {isPending ? "Saving…" : isEdit ? "Save changes" : "Add category"}
        </button>

        {isEdit && (
          <button
            type="button"
            disabled={isPending}
            onClick={handleDeleteClick}
            className={`mt-3 w-full rounded-2xl py-3 text-sm font-medium transition-colors ${
              confirmingDelete ? "bg-red-500 text-white" : "bg-red-50 text-red-500"
            }`}
          >
            {confirmingDelete ? "Tap again to delete" : "Delete category"}
          </button>
        )}
      </div>
    </div>
  );
}
