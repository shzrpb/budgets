"use client";

import { useState, useTransition } from "react";
import { addLineItem, addTransaction, deleteLineItem, updateLineItem, updateTransaction } from "@/app/actions";
import { SelectPopup, SelectRow, type SelectOption } from "@/components/ReceiptControls";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import { TrashIcon } from "@/components/icons";
import type { Account, Card, Category, LineItem, PaymentMethod, Recurrence, Transaction, TransactionType } from "@/lib/types";

export default function FixedSheetForm({
  transaction,
  categories,
  accounts,
  cards,
  lineItems = [],
  onClose,
}: {
  transaction?: Transaction;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  lineItems?: LineItem[];
  onClose: () => void;
}) {
  useRegisterSheetOpen(true);

  const isEdit = !!transaction;
  const fixedCategories = categories.filter((c) => c.is_fixed);
  const [type, setType] = useState<TransactionType>(transaction?.type ?? "spend");
  const [amount, setAmount] = useState(transaction?.amount.toString() ?? "");
  const [categoryId, setCategoryId] = useState<string | null>(
    transaction?.category_id ?? fixedCategories[0]?.id ?? null,
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
  const [isPending, startTransition] = useTransition();
  const [pickingCategory, setPickingCategory] = useState(false);
  const [pickingAccount, setPickingAccount] = useState(false);
  const [items, setItems] = useState(lineItems);
  const [newItemName, setNewItemName] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [, startLineItemTransition] = useTransition();

  const itemsTotal = items.reduce((sum, i) => sum + i.amount, 0);
  const hasLineItems = items.length > 0;
  const canSave = Number(amount) > 0;
  const showAccounts = type === "income" || paymentMethod === "cash";

  function handleAddItem() {
    const value = Number(newItemAmount);
    if (!newItemName.trim() || !(value > 0)) return;
    const name = newItemName.trim();
    // In create mode there's no transaction row yet, so new items just live
    // in local state — they get persisted together with the transaction on Save.
    const tempId = isEdit && transaction ? `pending-${Date.now()}` : `draft-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        id: tempId,
        user_id: transaction?.user_id ?? "",
        transaction_id: transaction?.id ?? "",
        name,
        amount: value,
        sort_order: prev.length,
        created_at: new Date().toISOString(),
      },
    ]);
    setAmount((itemsTotal + value).toString());
    setNewItemName("");
    setNewItemAmount("");
    if (isEdit && transaction) {
      startLineItemTransition(async () => {
        const inserted = await addLineItem(transaction.id, { name, amount: value });
        setItems((prev) => prev.map((i) => (i.id === tempId ? (inserted as LineItem) : i)));
      });
    }
  }

  /** Local edit only, so typing doesn't fire a request per keystroke. */
  function editItemLocal(id: string, name: string, itemAmount: number) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, name, amount: itemAmount } : i)));
  }

  /** Persists the field on blur, once the value has settled (create mode just recomputes the total). */
  function commitItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || !(item.amount > 0) || !item.name.trim() || item.id.startsWith("pending-")) return;
    setAmount(items.reduce((sum, i) => sum + i.amount, 0).toString());
    if (isEdit) {
      startLineItemTransition(() => updateLineItem(id, { name: item.name.trim(), amount: item.amount }));
    }
  }

  function handleDeleteItem(id: string) {
    const remaining = items.filter((i) => i.id !== id);
    setItems(remaining);
    // Once the last item is gone the amount reverts to being manually
    // editable again — the server leaves the last synced total in place.
    if (remaining.length > 0) {
      setAmount(remaining.reduce((sum, i) => sum + i.amount, 0).toString());
    }
    if (isEdit) startLineItemTransition(() => deleteLineItem(id));
  }

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
        occurredAt: startDate,
        recurrence,
      };
      if (isEdit) {
        await updateTransaction(transaction!.id, input);
      } else {
        await addTransaction({
          ...input,
          isFixed: true,
          lineItems: hasLineItems ? items.map((i) => ({ name: i.name, amount: i.amount })) : undefined,
        });
      }
      onClose();
    });
  }

  const selectedCategory = fixedCategories.find((c) => c.id === categoryId);
  const selectedCard = cards.find((c) => c.id === cardId);
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const accountOrCardLabel = type === "spend" && paymentMethod === "credit" ? "Card" : "Account";
  const accountOrCardValue =
    type === "spend" && paymentMethod === "credit" ? selectedCard?.name ?? "Select" : selectedAccount?.name ?? "Select";
  const accountOrCardOptions: SelectOption[] =
    type === "spend" && paymentMethod === "credit"
      ? cards.map((c) => ({ id: c.id, name: c.name }))
      : accounts.map((a) => ({ id: a.id, name: a.name }));
  const accountOrCardSelectedId = type === "spend" && paymentMethod === "credit" ? cardId : accountId;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30">
      <div className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stone-200" />

        <p className="text-sm font-semibold text-stone-800">
          {isEdit ? "Edit fixed spend or income" : "Add fixed spend or income"}
        </p>

        <div className="mt-3 flex rounded-full bg-stone-100 p-1">
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

        <div className="mt-4 flex items-center justify-center">
          <span className="text-2xl text-stone-400">$</span>
          <input
            inputMode="decimal"
            placeholder="0.00"
            value={hasLineItems ? itemsTotal.toString() : amount}
            disabled={hasLineItems}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            className="w-40 bg-transparent text-center text-4xl font-semibold tracking-tight outline-none disabled:text-stone-400"
          />
        </div>
        {hasLineItems && (
          <p className="mt-1 text-center text-xs text-stone-400">Sum of line items below</p>
        )}

        <div className="mt-4 flex flex-col gap-1.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <input
                value={item.name}
                onChange={(e) => editItemLocal(item.id, e.target.value, item.amount)}
                onBlur={() => commitItem(item.id)}
                placeholder="Name"
                className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm outline-none focus:border-stone-400"
              />
              <input
                inputMode="decimal"
                value={item.amount || ""}
                onChange={(e) =>
                  editItemLocal(item.id, item.name, Number(e.target.value.replace(/[^0-9.]/g, "")))
                }
                onBlur={() => commitItem(item.id)}
                placeholder="0.00"
                className="w-20 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-right text-sm outline-none focus:border-stone-400"
              />
              <button
                type="button"
                onClick={() => handleDeleteItem(item.id)}
                aria-label={`Remove ${item.name || "line item"}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-500"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="e.g. Phone"
              className="min-w-0 flex-1 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400"
            />
            <input
              inputMode="decimal"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              placeholder="0.00"
              className="w-20 rounded-xl border border-dashed border-stone-300 bg-white px-2 py-2 text-right text-sm outline-none focus:border-stone-400"
            />
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!newItemName.trim() || !(Number(newItemAmount) > 0)}
              aria-label="Add line item"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>

        {type === "spend" && (
          <div className="mt-1 flex items-center justify-between">
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

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs font-medium text-stone-400">Repeats</p>
          <div className="flex rounded-full bg-stone-100 p-1">
            {(["monthly", "yearly"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecurrence(r)}
                className={`rounded-full px-4 py-1 text-sm font-medium capitalize transition-colors ${
                  recurrence === r ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="shrink-0 text-xs font-medium text-stone-400">Starting</p>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm outline-none focus:border-stone-400"
          />
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2">
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
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {pickingCategory && (
        <SelectPopup
          title="Category"
          options={fixedCategories.map((c) => ({ id: c.id, name: c.name }))}
          selectedId={categoryId}
          onSelect={setCategoryId}
          onClose={() => setPickingCategory(false)}
          allowNew
          newCategoryIsFixed
        />
      )}
      {pickingAccount && (
        <SelectPopup
          title={accountOrCardLabel}
          options={accountOrCardOptions}
          selectedId={accountOrCardSelectedId}
          onSelect={(id) => {
            if (type === "spend" && paymentMethod === "credit") setCardId(id);
            else setAccountId(id);
          }}
          onClose={() => setPickingAccount(false)}
        />
      )}
    </div>
  );
}
