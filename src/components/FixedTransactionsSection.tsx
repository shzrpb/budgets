"use client";

import { useRef, useState } from "react";
import FixedSheet from "@/components/FixedSheet";
import FixedTransactionList from "@/components/FixedTransactionList";
import { PlusIcon } from "@/components/icons";
import type { Account, Card, Category, LineItem, Transaction } from "@/lib/types";

/** How much of each covered card peeks out in the collapsed stack. */
const PEEK_HEIGHT = 44;
const ROW_HEIGHT = 60;
/** Window for a second tap to register as a double tap, collapsing the stack. */
const DOUBLE_TAP_MS = 260;

const CADENCE_STYLES: Record<string, string> = {
  yearly: "bg-violet-100 text-violet-500",
  monthly: "bg-stone-100 text-stone-500",
  none: "bg-stone-100 text-stone-500",
};

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
  const [totalOnly, setTotalOnly] = useState(false);
  const [adding, setAdding] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const net = monthlyNet(transactions);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  /** Single tap expands the full list; a second tap within the window collapses to totals-only instead. */
  function handleStackTap() {
    if (tapTimer.current) {
      clearTimeout(tapTimer.current);
      tapTimer.current = null;
      setTotalOnly((v) => !v);
      return;
    }
    tapTimer.current = setTimeout(() => {
      tapTimer.current = null;
      setExpanded(true);
    }, DOUBLE_TAP_MS);
  }

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
      ) : totalOnly ? (
        <button
          type="button"
          onClick={handleStackTap}
          aria-label="Show fixed transaction previews"
          className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
          style={{ height: ROW_HEIGHT }}
        >
          <p className="text-sm font-medium text-stone-800">
            {transactions.length} fixed item{transactions.length === 1 ? "" : "s"}
          </p>
          <p className={`text-sm font-semibold ${net >= 0 ? "text-emerald-600" : "text-stone-900"}`}>
            {net >= 0 ? "+" : "−"}${Math.abs(Math.round(net)).toLocaleString()}/mo
          </p>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStackTap}
          aria-label={`Expand ${transactions.length} fixed transactions`}
          aria-expanded={false}
          className="relative block w-full text-left"
          style={{ height: (transactions.length - 1) * PEEK_HEIGHT + ROW_HEIGHT }}
        >
          {transactions.map((t, i) => {
            const category = t.category_id ? categoryById.get(t.category_id) : undefined;
            const dotColor = t.type === "income" ? "#10b981" : category?.color ?? "#a8a29e";
            return (
              <div
                key={t.id}
                className="absolute inset-x-0 flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
                style={{ top: i * PEEK_HEIGHT, zIndex: i, height: ROW_HEIGHT }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                  <p className="truncate text-sm font-medium text-stone-800">
                    {t.type === "income" ? "Income" : category?.name ?? "Uncategorized"}
                    <span
                      className={`ml-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                        CADENCE_STYLES[t.recurrence] ?? CADENCE_STYLES.none
                      }`}
                    >
                      {t.recurrence}
                    </span>
                  </p>
                </div>
                <p
                  className={`shrink-0 text-sm font-semibold ${
                    t.type === "income" ? "text-emerald-600" : "text-stone-900"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
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
