"use client";

import { useState, useTransition } from "react";
import { addTransaction } from "@/app/actions";
import CategoryPill from "@/components/CategoryPill";
import AddCategorySheet from "@/components/AddCategorySheet";
import type { Account, Category, Recurrence, TransactionType } from "@/lib/types";

export default function AddFixedSheet({
  categories,
  accounts,
}: {
  categories: Category[];
  accounts: Account[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-dashed border-stone-300 py-3 text-sm font-medium text-stone-500 transition-colors hover:border-stone-400 hover:text-stone-700"
      >
        + Fixed spend or income
      </button>

      {open && (
        <Sheet categories={categories} accounts={accounts} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function Sheet({
  categories,
  accounts,
  onClose,
}: {
  categories: Category[];
  accounts: Account[];
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>("spend");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null);
  const [accountId, setAccountId] = useState<string | null>(accounts[0]?.id ?? null);
  const [recurrence, setRecurrence] = useState<Recurrence>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [addingCategory, setAddingCategory] = useState(false);

  const canSave = Number(amount) > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addTransaction({
        amount: Number(amount),
        type,
        categoryId: type === "spend" ? categoryId : null,
        accountId,
        paymentMethod: null,
        note: note || undefined,
        occurredAt: startDate,
        isFixed: true,
        recurrence,
      });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">Add fixed spend or income</p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <div className="mt-4 flex rounded-full bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => setType("spend")}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              type === "spend" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
            }`}
          >
            Spend
          </button>
          <button
            type="button"
            onClick={() => setType("income")}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              type === "income" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
            }`}
          >
            Income
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <span className="text-2xl text-stone-400">$</span>
          <input
            autoFocus
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-40 bg-transparent text-center text-4xl font-semibold tracking-tight outline-none"
          />
        </div>

        {type === "spend" && (
          <>
            <p className="mt-5 text-xs font-medium text-stone-400">Category</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((c) => (
                <CategoryPill
                  key={c.id}
                  name={c.name}
                  color={c.color}
                  selected={categoryId === c.id}
                  onClick={() => setCategoryId(c.id)}
                />
              ))}
              <button
                type="button"
                onClick={() => setAddingCategory(true)}
                className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-500"
              >
                + New
              </button>
            </div>
          </>
        )}

        {accounts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-medium text-stone-400">Account</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {accounts.map((a) => (
                <CategoryPill
                  key={a.id}
                  name={a.name}
                  color={a.color}
                  selected={accountId === a.id}
                  onClick={() => setAccountId(a.id)}
                />
              ))}
            </div>
          </>
        )}

        <p className="mt-5 text-xs font-medium text-stone-400">Repeats</p>
        <div className="mt-2 flex rounded-full bg-stone-100 p-1">
          {(["monthly", "yearly"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRecurrence(r)}
              className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                recurrence === r ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-medium text-stone-400">Starting</p>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="mt-3 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <button
          type="button"
          disabled={!canSave || isPending}
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>

      {addingCategory && <AddCategorySheet onClose={() => setAddingCategory(false)} />}
    </div>
  );
}
