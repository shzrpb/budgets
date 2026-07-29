"use client";

import { useState } from "react";
import FixedSheet from "@/components/FixedSheet";
import FixedTransactionList from "@/components/FixedTransactionList";
import { PlusIcon } from "@/components/icons";
import type { Account, Card, Category, LineItem, Transaction } from "@/lib/types";

/** How much of each covered card peeks out in the collapsed stack. */
const PEEK_HEIGHT = 28;
const ROW_HEIGHT = 52;
const MAX_STACKED = 4;

/**
 * Monthly-equivalent net, so a yearly $120 subscription doesn't read as if it
 * hits every month. Yearly items are divided across 12.
 */
function monthlyNet(transactions: Transaction[]) {
  return transactions.reduce((sum, t) => {
    const perMonth = t.recurrence === "yearly" ? t.amount / 12 : t.amount;
    return sum + (t.type === "income" ? perMonth : -perMonth);
  }, 0);
}

export default function FixedTransactionsSection({
  transactions,
  categories,
  accounts,
  cards,
  lineItems = [],
}: {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  cards: Card[];
  lineItems?: LineItem[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [adding, setAdding] = useState(false);

  const net = monthlyNet(transactions);
  const stacked = transactions.slice(0, MAX_STACKED);
  const hidden = transactions.length - stacked.length;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <p className="text-sm font-medium text-stone-500">Fixed transactions</p>
          {transactions.length > 0 && (
            <p className="text-xs text-stone-400">
              {net >= 0 ? "+" : "−"}${Math.abs(Math.round(net)).toLocaleString()}/mo
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Add a fixed transaction"
          className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100"
        >
          <PlusIcon />
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-stone-400 shadow-sm">
          Nothing fixed yet — rent, salary, subscriptions.
        </p>
      ) : expanded ? (
        <FixedTransactionList
          transactions={transactions}
          categories={categories}
          accounts={accounts}
          cards={cards}
          lineItems={lineItems}
          showDetail
          onRowClick={() => setExpanded(false)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Expand ${transactions.length} fixed transactions`}
          aria-expanded={false}
          className="relative block w-full text-left"
          style={{ height: (stacked.length - 1) * PEEK_HEIGHT + ROW_HEIGHT }}
        >
          {stacked.map((t, i) => (
            <div
              key={t.id}
              className="absolute inset-x-0 rounded-2xl bg-white px-4 pt-2.5 shadow-sm"
              style={{ top: i * PEEK_HEIGHT, zIndex: i, height: ROW_HEIGHT }}
            >
              <p
                className={`text-right text-sm font-semibold ${
                  t.type === "income" ? "text-emerald-600" : "text-stone-900"
                }`}
              >
                {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
              </p>
            </div>
          ))}
          {hidden > 0 && (
            <span
              className="absolute bottom-2 right-4 rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500"
              style={{ zIndex: stacked.length }}
            >
              +{hidden} more
            </span>
          )}
        </button>
      )}

      {adding && (
        <FixedSheet
          categories={categories}
          accounts={accounts}
          cards={cards}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}
