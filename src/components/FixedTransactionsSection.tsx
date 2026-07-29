"use client";

import { useState } from "react";
import AddMoreButton from "@/components/AddMoreButton";
import FixedSheet from "@/components/FixedSheet";
import FixedTransactionList, { FixedRow } from "@/components/FixedTransactionList";
import { MinusIcon, PlusIcon } from "@/components/icons";
import type { Account, Card, Category, LineItem, Transaction } from "@/lib/types";

/** How much of each covered card peeks out in the collapsed stack. */
const PEEK_HEIGHT = 40;
const ROW_HEIGHT = 60;
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

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const accountById = new Map(accounts.map((a) => [a.id, a]));
  const cardById = new Map(cards.map((c) => [c.id, c]));

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
          onClick={() => (transactions.length === 0 ? setAdding(true) : setExpanded((v) => !v))}
          aria-label={
            transactions.length === 0
              ? "Add a fixed transaction"
              : expanded
                ? "Collapse fixed transactions"
                : "Expand fixed transactions"
          }
          aria-expanded={transactions.length > 0 ? expanded : undefined}
          className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100"
        >
          {expanded ? <MinusIcon /> : <PlusIcon />}
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-5 text-center text-sm text-stone-400 shadow-sm">
          Nothing fixed yet — rent, salary, subscriptions.
        </p>
      ) : expanded ? (
        <>
          <FixedTransactionList
            transactions={transactions}
            categories={categories}
            accounts={accounts}
            cards={cards}
            lineItems={lineItems}
          />
          <AddMoreButton onClick={() => setAdding(true)} />
        </>
      ) : (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={`Expand ${transactions.length} fixed transactions`}
          className="relative block w-full text-left"
          style={{ height: (stacked.length - 1) * PEEK_HEIGHT + ROW_HEIGHT }}
        >
          {stacked.map((t, i) => {
            // Covered cards fade out where the next card overlaps them, so the
            // stack reads as depth rather than as text chopped in half.
            const covered = i < stacked.length - 1;
            return (
            <div
              key={t.id}
              className="absolute inset-x-0"
              style={{
                top: i * PEEK_HEIGHT,
                zIndex: i,
                ...(covered
                  ? {
                      maskImage: `linear-gradient(to bottom, #000 ${PEEK_HEIGHT - 16}px, transparent ${PEEK_HEIGHT}px)`,
                      WebkitMaskImage: `linear-gradient(to bottom, #000 ${PEEK_HEIGHT - 16}px, transparent ${PEEK_HEIGHT}px)`,
                    }
                  : {}),
              }}
            >
              <FixedRow
                transaction={t}
                category={t.category_id ? categoryById.get(t.category_id) : undefined}
                account={t.account_id ? accountById.get(t.account_id) : undefined}
                card={t.card_id ? cardById.get(t.card_id) : undefined}
              />
            </div>
            );
          })}
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
