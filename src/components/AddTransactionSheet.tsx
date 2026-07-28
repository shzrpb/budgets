"use client";

import { useState, useTransition } from "react";
import { addTransaction } from "@/app/actions";
import CategoryPill from "@/components/CategoryPill";
import AddCategorySheet from "@/components/AddCategorySheet";
import type { Account, Card, Category, PaymentMethod, TransactionType } from "@/lib/types";

export default function AddTransactionSheet({
  categories,
  accounts,
  cards = [],
  center = false,
}: {
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
  center?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
        <div className={`flex w-full max-w-md px-4 ${center ? "justify-center" : "justify-end"}`}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Add spend or income"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-white shadow-lg transition-transform active:scale-95"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <Sheet
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function Sheet({
  categories,
  accounts,
  cards,
  onClose,
}: {
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  onClose: () => void;
}) {
  const [type, setType] = useState<TransactionType>("spend");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [cardId, setCardId] = useState<string | null>(cards[0]?.id ?? null);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);

  const canSave = Number(amount) > 0;

  const showAccounts = type === "income" || paymentMethod === "cash";

  function handleType(next: TransactionType) {
    setType(next);
    if (next === "income") setAccountId((id) => id ?? accounts[0]?.id ?? null);
    else if (paymentMethod === "credit") setAccountId(null);
  }

  function handlePaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method === "credit") setAccountId(null);
    else setAccountId((id) => id ?? accounts[0]?.id ?? null);
  }

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addTransaction({
        amount: Number(amount),
        type,
        categoryId: type === "spend" ? categoryId : null,
        accountId: showAccounts ? accountId : null,
        paymentMethod: type === "spend" ? paymentMethod : null,
        cardId: type === "spend" && paymentMethod === "credit" ? cardId : null,
        note: note || undefined,
      });
      setToast(true);
      setTimeout(() => {
        onClose();
      }, 500);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />

        <div className="flex items-center justify-between">
          <div className="flex rounded-full bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => handleType("spend")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === "spend" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
              }`}
            >
              Spend
            </button>
            <button
              type="button"
              onClick={() => handleType("income")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                type === "income" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
              }`}
            >
              Income
            </button>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <div className="mt-5 flex items-center justify-center">
          <span className="text-2xl text-stone-400">$</span>
          <input
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

            <p className="mt-5 text-xs font-medium text-stone-400">Paid with</p>
            <div className="mt-2 flex rounded-full bg-stone-100 p-1">
              {(["cash", "credit"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handlePaymentMethod(m)}
                  className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${
                    paymentMethod === m ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {paymentMethod === "credit" && cards.length > 0 && (
              <>
                <p className="mt-5 text-xs font-medium text-stone-400">Card</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {cards.map((c) => (
                    <CategoryPill
                      key={c.id}
                      name={c.name}
                      selected={cardId === c.id}
                      onClick={() => setCardId(c.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {showAccounts && accounts.length > 0 && (
          <>
            <p className="mt-5 text-xs font-medium text-stone-400">Account</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {accounts.map((a) => (
                <CategoryPill
                  key={a.id}
                  name={a.name}
                  selected={accountId === a.id}
                  onClick={() => setAccountId(a.id)}
                />
              ))}
            </div>
          </>
        )}

        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)"
          className="mt-5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <button
          type="button"
          disabled={!canSave || isPending}
          onClick={handleSave}
          className="mt-5 w-full rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
        >
          {toast ? "Saved" : isPending ? "Saving…" : `Save ${type}`}
        </button>
      </div>

      {addingCategory && <AddCategorySheet onClose={() => setAddingCategory(false)} />}
    </div>
  );
}
