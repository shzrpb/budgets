"use client";

import { useState, useTransition } from "react";
import { deleteTransaction } from "@/app/actions";
import { EditTransactionSheet } from "@/components/AddTransactionSheet";
import FixedTransactionsSection from "@/components/FixedTransactionsSection";
import SwipeActions from "@/components/SwipeActions";
import TransactionIcon from "@/components/TransactionIcon";
import { editDeleteActions } from "@/components/rowActions";
import { formatMoney } from "@/lib/format";
import type { Account, Card, Category, LineItem, Transaction } from "@/lib/types";

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
  lineItems = [],
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  cards?: Card[];
  lineItems?: LineItem[];
}) {
  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const cardById = new Map(cards.map((c) => [c.id, c]));

  const fixed = transactions
    .filter((t) => t.is_fixed)
    .sort((a, b) => (a.sort_order ?? Number.MAX_SAFE_INTEGER) - (b.sort_order ?? Number.MAX_SAFE_INTEGER));
  const daily = transactions.filter((t) => !t.is_fixed);
  const groups = groupByDay(daily);

  return (
    <div className="flex flex-col gap-5">
      <FixedTransactionsSection
        transactions={fixed}
        categories={categories}
        accounts={accounts}
        cards={cards}
        lineItems={lineItems}
      />

      {daily.length === 0 ? (
        <p className="mt-4 text-center text-sm text-stone-400">
          No spending logged yet. Tap + to add one.
        </p>
      ) : (
        groups.map(([day, items]) => (
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
                  categories={categories}
                  accounts={accounts}
                  cards={cards}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function Row({
  transaction,
  category,
  account,
  card,
  categories,
  accounts,
  cards,
}: {
  transaction: Transaction;
  category?: Category;
  account?: Account;
  card?: Card;
  categories: Category[];
  accounts: Account[];
  cards: Card[];
}) {
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();

  const tint = transaction.type === "income" ? "#7fc9b9" : category?.color ?? "#a8a29e";
  const categoryName =
    transaction.type === "income" ? "Income" : category?.name ?? "Uncategorized";
  // The merchant (note) is what you actually recognise in a list of spends;
  // the category is context, so it drops to the subtitle.
  const title = transaction.note?.trim() || categoryName;
  const subtitle = [
    title === categoryName ? null : categoryName,
    card?.name ?? account?.name ?? transaction.payment_method,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <SwipeActions
        actions={editDeleteActions({
          onEdit: () => setEditing(true),
          onDelete: () => startTransition(() => deleteTransaction(transaction.id)),
        })}
      >
        <div className="surface-card flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: `${tint}33`, color: tint }}
            >
              <TransactionIcon name={category?.name} isIncome={transaction.type === "income"} />
            </span>
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
              <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>
            </div>
          </div>
          <p
            className="font-mono text-sm font-semibold"
            style={{ color: transaction.type === "income" ? "var(--text-success)" : "var(--text-primary)" }}
          >
            {transaction.type === "income" ? "+" : "-"}${formatMoney(transaction.amount)}
          </p>
        </div>
      </SwipeActions>

      {editing && (
        <EditTransactionSheet
          transaction={transaction}
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setEditing(false)}
        />
      )}
    </>
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
