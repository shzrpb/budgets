"use client";

import { useEffect, useState, useTransition } from "react";
import { addTransaction, updateTransaction } from "@/app/actions";
import { Dashes, SelectPopup, SelectRow, type SelectOption } from "@/components/ReceiptControls";
import { useAnySheetOpen, useRegisterSheetOpen } from "@/lib/sheetVisibility";
import type { Account, Card, Category, PaymentMethod, Transaction, TransactionType } from "@/lib/types";

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "long" });

/** Builds a jagged "torn paper" clip-path: flat sides, zig-zag top/bottom. */
function tornEdgeClipPath(teeth = 16, depth = 1.4): string {
  const points: string[] = [];
  for (let i = 0; i <= teeth; i++) {
    const x = (i / teeth) * 100;
    points.push(`${x}% ${i % 2 === 0 ? 0 : depth}%`);
  }
  points.push(`100% ${100 - depth}%`);
  for (let i = teeth; i >= 0; i--) {
    const x = (i / teeth) * 100;
    points.push(`${x}% ${i % 2 === 0 ? 100 : 100 - depth}%`);
  }
  points.push(`0% ${depth}%`);
  return `polygon(${points.join(", ")})`;
}

const RECEIPT_CLIP = tornEdgeClipPath();

function pad(n: number, len: number): string {
  return n.toString().padStart(len, "0");
}

/** Ticking "printed at" timestamp, e.g. "Tue, 28 Jul · 10:25:33 PM". */
function ReceiptClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="text-center font-mono text-xs tracking-wide text-stone-500 tabular-nums">
      {now
        ? `${now.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" })} · ${now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}`
        : " "}
    </p>
  );
}

export default function AddTransactionSheet({
  categories,
  accounts,
  cards = [],
  monthlyBudget = 0,
  spent = 0,
  transactionCount = 0,
}: {
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
  monthlyBudget?: number;
  spent?: number;
  transactionCount?: number;
}) {
  const [open, setOpen] = useState(false);
  useRegisterSheetOpen(open);
  const anySheetOpen = useAnySheetOpen();

  return (
    <>
      {/* Bottom-right FAB, clear of the pill nav bar. Hidden whenever any
          sheet (this one or another) is open. */}
      {!anySheetOpen && (
        <div
          className="pointer-events-none fixed inset-x-0 z-50 flex justify-end pr-5"
          style={{ bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 86px)" }}
        >
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
      )}

      {open && (
        <Receipt
          categories={categories}
          accounts={accounts}
          cards={cards}
          monthlyBudget={monthlyBudget}
          spent={spent}
          transactionCount={transactionCount}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export function EditTransactionSheet({
  transaction,
  categories,
  accounts,
  cards,
  monthlyBudget = 0,
  spent = 0,
  transactionCount = 0,
  onClose,
}: {
  transaction: Transaction;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  monthlyBudget?: number;
  spent?: number;
  transactionCount?: number;
  onClose: () => void;
}) {
  return (
    <Receipt
      transaction={transaction}
      categories={categories}
      accounts={accounts}
      cards={cards}
      monthlyBudget={monthlyBudget}
      spent={spent}
      transactionCount={transactionCount}
      onClose={onClose}
    />
  );
}

function Receipt({
  transaction,
  categories,
  accounts,
  cards,
  monthlyBudget,
  spent,
  transactionCount,
  onClose,
}: {
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  monthlyBudget: number;
  spent: number;
  transactionCount: number;
  onClose: () => void;
}) {
  const isEdit = !!transaction;
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "spend");
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.category_id ?? categories[0]?.id ?? null,
  );
  const [accountId, setAccountId] = useState<string | null>(transaction?.account_id ?? null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    transaction?.payment_method ?? "credit",
  );
  const [cardId, setCardId] = useState<string | null>(transaction?.card_id ?? cards[0]?.id ?? null);
  const [note, setNote] = useState(transaction?.note ?? "");
  const [occurredAt, setOccurredAt] = useState(
    transaction?.occurred_at ?? new Date().toISOString().slice(0, 10),
  );
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState(false);
  const [pickingCategory, setPickingCategory] = useState(false);
  const [pickingAccount, setPickingAccount] = useState(false);

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
      const input = {
        amount: Number(amount),
        type,
        categoryId: type === "spend" ? categoryId : null,
        accountId: showAccounts ? accountId : null,
        paymentMethod: type === "spend" ? paymentMethod : null,
        cardId: type === "spend" && paymentMethod === "credit" ? cardId : null,
        note: note || undefined,
      };
      if (isEdit) {
        await updateTransaction(transaction!.id, { ...input, occurredAt });
        onClose();
        return;
      }
      await addTransaction(input);
      setToast(true);
      setTimeout(() => {
        onClose();
      }, 500);
    });
  }

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedCard = cards.find((c) => c.id === cardId);
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const accountOrCardLabel = paymentMethod === "credit" && type === "spend" ? "Card" : "Account";
  const accountOrCardValue =
    paymentMethod === "credit" && type === "spend" ? selectedCard?.name ?? "Select" : selectedAccount?.name ?? "Select";
  const accountOrCardOptions: SelectOption[] =
    paymentMethod === "credit" && type === "spend"
      ? cards.map((c) => ({ id: c.id, name: c.name }))
      : accounts.map((a) => ({ id: a.id, name: a.name }));
  const accountOrCardSelectedId = paymentMethod === "credit" && type === "spend" ? cardId : accountId;

  const remainingAfter =
    monthlyBudget - spent + (isEdit ? transaction!.amount : 0) - (type === "spend" ? Number(amount) || 0 : 0);
  const receiptNo = pad(transactionCount + 1, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div style={{ filter: "drop-shadow(0 14px 28px rgba(0,0,0,0.22))" }} className="w-full max-w-sm">
        <div
          style={{ clipPath: RECEIPT_CLIP }}
          className="w-full bg-white px-6 pt-7 pb-6 font-mono"
        >
          <div className="flex justify-center">
            <div className="flex rounded-full bg-stone-100 p-1">
              <button
                type="button"
                onClick={() => handleType("spend")}
                className={`rounded-full px-5 py-1.5 text-sm font-sans font-medium transition-colors ${
                  type === "spend" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                }`}
              >
                Spend
              </button>
              <button
                type="button"
                onClick={() => handleType("income")}
                className={`rounded-full px-5 py-1.5 text-sm font-sans font-medium transition-colors ${
                  type === "income" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                }`}
              >
                Income
              </button>
            </div>
          </div>

          <div className="mt-4">
            <ReceiptClock />
            <p className="mt-1 text-center text-xs tracking-widest text-stone-400">
              NO: {receiptNo}
            </p>
          </div>

          <Dashes />

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Item"
            className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400"
          />

          <Dashes />

          <div className="flex items-center justify-between">
            <span className="text-sm font-bold tracking-wide text-stone-800">TOTAL</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg text-stone-400">$</span>
              <input
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-28 bg-transparent text-right text-3xl font-semibold tracking-tight text-stone-900 outline-none placeholder:text-stone-300"
              />
            </div>
          </div>

          <Dashes />

          <div className="font-sans">
            {type === "spend" && (
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-400">Paid with</p>
                <div className="flex rounded-full bg-stone-100 p-1">
                  {(["cash", "credit"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handlePaymentMethod(m)}
                      className={`rounded-full px-4 py-1 text-sm font-medium capitalize transition-colors ${
                        paymentMethod === m ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {((type === "spend" && paymentMethod === "credit" && cards.length > 0) ||
              (showAccounts && accounts.length > 0)) && (
              <SelectRow
                label={accountOrCardLabel}
                value={accountOrCardValue}
                onClick={() => setPickingAccount(true)}
              />
            )}

            {type === "spend" && (
              <SelectRow
                label="Category"
                value={selectedCategory?.name ?? "Select"}
                onClick={() => setPickingCategory(true)}
              />
            )}

            {isEdit && (
              <div className="mt-3">
                <p className="text-xs font-medium text-stone-400">Date</p>
                <input
                  type="date"
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  className="mt-1.5 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none focus:border-stone-400"
                />
              </div>
            )}
          </div>

          <Dashes />

          <p className="text-center text-xs text-stone-500">
            Thank you • <span className="font-sans">${remainingAfter.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span> left in{" "}
            {MONTH_LABEL.format(new Date())}
          </p>

          <div className="mt-5 grid grid-cols-5 gap-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="col-span-2 rounded-2xl bg-stone-100 py-3 text-sm font-medium text-stone-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSave || isPending}
              onClick={handleSave}
              className="col-span-3 rounded-2xl bg-stone-900 py-3 text-sm font-medium text-white transition-colors disabled:opacity-40"
            >
              {toast ? "Saved" : isPending ? "Saving…" : isEdit ? "Save changes" : `Save ${type}`}
            </button>
          </div>
        </div>
      </div>

      {pickingCategory && (
        <SelectPopup
          title="Category"
          options={categories.map((c) => ({ id: c.id, name: c.name }))}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onClose={() => setPickingCategory(false)}
          allowNew
        />
      )}
      {pickingAccount && (
        <SelectPopup
          title={accountOrCardLabel}
          options={accountOrCardOptions}
          selectedId={accountOrCardSelectedId}
          onSelect={(id) => {
            if (paymentMethod === "credit" && type === "spend") setCardId(id);
            else setAccountId(id);
          }}
          onClose={() => setPickingAccount(false)}
        />
      )}
    </div>
  );
}
