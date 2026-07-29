"use client";

import { useEffect, useRef, useState } from "react";
import CategoryPill from "@/components/CategoryPill";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import type { Card, Category, Transaction } from "@/lib/types";

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "long" });

/** Approximate chip row height + row gap (gap-2), used only to figure out how many rows fit. */
const CHIP_ROW_HEIGHT = 32;
const ROW_GAP = 8;
/** Estimated inner width (px) of the card's chip row, used only to pack chips tightly. */
const ROW_WIDTH = 300;

function fmtAbs(n: number): string {
  return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Rough pixel width of a category chip, from its text length — good enough for packing, not pixel-perfect. */
function estimateChipWidth(name: string, amount: number): number {
  return 30 + name.length * 7.2 + amount.toLocaleString().length * 7.5;
}

type CategoryTotal = { category: Category; amount: number };

/**
 * Greedily packs chips into fixed-width rows (first-fit, largest first) so
 * each row uses as much of its space as possible, instead of just listing
 * chips in amount order and letting them wrap wherever they happen to fall.
 */
function packIntoRows(totals: CategoryTotal[], rowWidth: number): CategoryTotal[][] {
  const byWidth = [...totals].sort(
    (a, b) => estimateChipWidth(b.category.name, b.amount) - estimateChipWidth(a.category.name, a.amount),
  );
  const rows: { items: CategoryTotal[]; used: number }[] = [];
  for (const item of byWidth) {
    const width = estimateChipWidth(item.category.name, item.amount);
    const row = rows.find((r) => r.used + width <= rowWidth);
    if (row) {
      row.items.push(item);
      row.used += width;
    } else {
      rows.push({ items: [item], used: width });
    }
  }
  return rows.map((r) => r.items);
}

export default function MonthGlanceCard({
  transactions,
  categories,
  monthlyBudget,
  overLimitCards = [],
}: {
  transactions: Transaction[];
  categories: Category[];
  monthlyBudget: number;
  overLimitCards?: Card[];
}) {
  const [showAll, setShowAll] = useState(false);
  useRegisterSheetOpen(showAll);

  // The homepage is a fixed, non-scrolling page — however much room is left
  // under the alerts/progress bar is however much room the chips get. More
  // alerts above means less space here, and vice versa.
  const chipAreaRef = useRef<HTMLDivElement>(null);
  const [maxRows, setMaxRows] = useState(3);

  useEffect(() => {
    const el = chipAreaRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0]?.contentRect.height ?? 0;
      const rows = Math.max(1, Math.floor((height + ROW_GAP) / (CHIP_ROW_HEIGHT + ROW_GAP)));
      setMaxRows(rows);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const spent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const progress = monthlyBudget > 0 ? Math.min(spent / monthlyBudget, 1) : 0;
  const nearLimit = monthlyBudget > 0 && spent / monthlyBudget >= 0.8;
  const remaining = monthlyBudget - spent;

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();

  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    if (!t.category_id) continue;
    byCategory.set(t.category_id, (byCategory.get(t.category_id) ?? 0) + t.amount);
  }
  const categoryTotals = categories
    .map((c) => ({ category: c, amount: byCategory.get(c.id) ?? 0 }))
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  const allRows = packIntoRows(categoryTotals, ROW_WIDTH);
  // If everything fits within the measured space, show it all. Otherwise
  // reserve the last row purely for "See all" so it never gets clipped.
  const fitsFully = allRows.length <= maxRows;
  const visibleRows = fitsFully ? allRows : allRows.slice(0, Math.max(0, maxRows - 1));
  const visible = visibleRows.flat();
  const hiddenCount = categoryTotals.length - visible.length;

  return (
    <div className="flex min-h-64 flex-1 flex-col rounded-3xl bg-gradient-to-br from-amber-50 to-green-50 p-4 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.08)] ring-1 ring-inset ring-white/60">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">
          {MONTH_LABEL.format(now)} at a glance
        </p>
        <p className="font-mono text-xs text-stone-400">
          ${spent.toLocaleString()} / {monthlyBudget.toLocaleString()}
        </p>
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? "bg-amber-400" : "bg-stone-400"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-stone-400">
        <span className="font-mono">${fmtAbs(remaining)}</span> {remaining >= 0 ? "left" : "over"}
        {" · "}
        <span className="font-mono">{daysLeft}</span> day{daysLeft === 1 ? "" : "s"} to go
      </p>

      {overLimitCards.length > 0 && (
        <p className="mt-3 text-xs font-medium text-red-500">
          ⚠ Over limit: {overLimitCards.map((c) => c.name).join(", ")}
        </p>
      )}

      {categoryTotals.length > 0 && (
        <div ref={chipAreaRef} className="mt-4 min-h-0 flex-1 overflow-hidden">
          <div className="flex flex-wrap gap-2">
            {visible.map(({ category, amount }) => (
              <CategoryPill key={category.id} name={category.name} amount={amount} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <div className="mt-2 flex">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="inline-flex items-center rounded-full bg-stone-800 px-3 py-1.5 text-sm font-medium text-white"
              >
                See all
              </button>
            </div>
          )}
        </div>
      )}

      {showAll && (
        <BreakdownSheet
          month={MONTH_LABEL.format(now)}
          totals={categoryTotals}
          onClose={() => setShowAll(false)}
        />
      )}
    </div>
  );
}

function BreakdownSheet({
  month,
  totals,
  onClose,
}: {
  month: string;
  totals: CategoryTotal[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-stone-200" />
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-stone-800">{month} breakdown</p>
          <button type="button" onClick={onClose} className="text-sm text-stone-400">
            Close
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-1">
          {totals.map(({ category, amount }) => (
            <div key={category.id} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                <p className="text-sm text-stone-700">{category.name}</p>
              </div>
              <p className="font-mono text-sm text-stone-800">${amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
