"use client";

import { useState, useTransition } from "react";
import { addTransaction, updateTransaction } from "@/app/actions";
import CategoryPill from "@/components/CategoryPill";
import AddCategorySheet from "@/components/AddCategorySheet";
import type { Account, Card, Category, PaymentMethod, Recurrence, Transaction, TransactionType } from "@/lib/types";

export default function AddFixedSheet({
  categories,
  accounts,
  cards = [],
}: {
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
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
        <FixedSheetForm
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function EditFixedSheet({
  transaction,
  categories,
  accounts,
  cards = [],
  trigger,
  triggerClassName = "block w-full text-left",
}: {
  transaction: Transaction;
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
  trigger: React.ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {trigger}
      </button>

      {open && (
        <FixedSheetForm
          transaction={transaction}
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function FixedSheetForm({
  transaction,
  categories,
  accounts,
  cards,
  onClose,
}: {
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  onClose: () => void;
}) {
  const isEdit = !!transaction;
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "spend");
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.category_id ?? categories[0]?.id ?? null,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction?.payment_method ?? "cash",
  );
  const [cardId, setCardId] = useState<string | null>(transaction?.card_id ?? cards[0]?.id ?? null);
  const [accountId, setAccountId] = useState<string | null>(
    transaction ? transaction.account_id : accounts[0]?.id ?? null,
  );
  const [recurrence, setRecurrence] = useState<Recurrence>(transaction?.recurrence ?? "monthly");
  const [startDate, setStartDate] = useState(
    transaction?.occurred_at ?? new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState(transaction?.note ?? "");
  const [isPending, startTransition] = useTransition();
  const [addingCategory, setAddingCategory] = useState(false);

  const canSave = Number(amount) > 0;
  const showAccounts = type === "income" || paymentMethod === "cash";

  function handlePaymentMethod(method: PaymentMethod) {
    setPaymentMethod(method);
    if (method === "credit") setAccountId(null);
    else setAccountId((id) => id ?? accounts[0]?.id ?? null);
  }

  function handleType(next: TransactionType) {
    setType(next);
    if (next === "income") setAccountId((id) => id ?? accounts[0]?.id ?? null);
    else if (paymentMethod === "credit") setAccountId(null);
  }

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      const input = {
        amount: Number(amount),
        type,
        categoryId: type === "spend" ? categoryId : null,
        accountId: showAccounts ? accountId : null,
        paymentMethod: type === "spend" ? paymentMethod : null,
        cardId: type === "spend" && paymentMethod === "credit" ? cardId : null,
        note: note || undefined,
        occurredAt: startDate,
        recurrence,
      };
      if (isEdit) {
        await updateTransaction(transaction!.id, input);
      } else {
        await addTransaction({ ...input, isFixed: true });
      }
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />

        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">
            {isEdit ? "Edit fixed spend or income" : "Add fixed spend or income"}
          </p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Cancel
          </button>
        </div>

        <div className="mt-4 flex rounded-full bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => handleType("spend")}
            className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              type === "spend" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
            }`}
          >
            Spend
          </button>
          <button
            type="button"
            onClick={() => handleType("income")}
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
