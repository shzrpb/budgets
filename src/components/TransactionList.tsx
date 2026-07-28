"use client";

import { useTransition } from "react";
import { deleteTransaction } from "@/app/actions";
import FixedTransactionList from "@/components/FixedTransactionList";
import TransactionIcon from "@/components/TransactionIcon";
import type { Account, Card, Category, Transaction } from "@/lib/types";

const DAY_LABEL = new Intl.DateTimeFormat("en", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

export default function TransactionList({
  transactions,
  categories,
  accounts,
  cards = [],
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const cardById = new Map(cards.map((c) => [c.id, c]));

  const fixed = transactions
    .filter((t) => t.is_fixed)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER));
  const daily = transactions.filter((t) => !t.is_fixed);
  const groups = groupByDay(daily);

  if (transactions.length === 0) {
    return (
      <p className="mt-8 text-center text-sm text-stone-400">
        No transactions yet. Tap + to log your first one.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {fixed.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-stone-400">Fixed spend & income</p>
          <FixedTransactionList
            transactions={fixed}
            categories={categories}
            accounts={accounts}
            cards={cards}
          />
        </div>
      )}

      {groups.map(([day, items]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-medium text-stone-400">
            {DAY_LABEL.format(new Date(`${day}T00:00:00`))}
          </p>
          <div className="flex flex-col gap-2">
            {items.map((t) => (
              <Row
                key={t.id}
                transaction={t}
                category={t.category_id ? categoryById.get(t.category_id) : undefined}
                account={t.account_id ? accountById.get(t.account_id) : undefined}
                card={t.card_id ? cardById.get(t.card_id) : undefined}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RowContent({
  transaction,
  category,
  account,
  card,
  trailing,
}: {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  card?: Card;
  trailing?: React.ReactNode;
}) {
  const tint = transaction.type === "income" ? "#7fc9b9" : category?.color ?? "#a8a29e";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${tint}33`, color: tint }}
        >
          <TransactionIcon name={category?.name} isIncome={transaction.type === "income"} />
        </span>
        <div>
          <p className="text-sm font-medium text-stone-800">
            {transaction.type === "income" ? "Income" : category?.name ?? "Uncategorized"}
            {transaction.is_fixed && (
              <span className="ml-1.5 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">
                {transaction.recurrence}
              </span>
            )}
          </p>
          <p className="text-xs text-stone-400">
            {[account?.name, card?.name ?? transaction.payment_method].filter(Boolean).join(" · ") ||
              (transaction.note ?? undefined)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p
          className={`text-sm font-semibold ${
            transaction.type === "income" ? "text-emerald-600" : "text-stone-900"
          }`}
        >
          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
        </p>
        {trailing}
      </div>
    </div>
  );
}

function Row({
  transaction,
  category,
  account,
  card,
}: {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  card?: Card;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <RowContent
      transaction={transaction}
      category={category}
      account={account}
      card={card}
      trailing={
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => deleteTransaction(transaction.id))}
          className="text-stone-300 transition-colors hover:text-red-400"
          aria-label="Delete transaction"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" />
          </svg>
        </button>
      }
    />
  );
}

function groupByDay(transactions: Transaction[]): [string, Transaction[]][] {
  const map = new Map<string, Transaction[]>();
  for (const t of transactions) {
    const key = t.occurred_at;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}
