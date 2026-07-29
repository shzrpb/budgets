import CategoryPill from "@/components/CategoryPill";
import type { Card, Category, Transaction } from "@/lib/types";

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "long" });

function fmtAbs(n: number): string {
  return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
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

  return (
    <div className="rounded-3xl bg-gradient-to-br from-white to-amber-50 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">
          {MONTH_LABEL.format(now)} spending
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
        <div className="mt-4 flex flex-wrap gap-2">
          {categoryTotals.map(({ category, amount }) => (
            <CategoryPill
              key={category.id}
              name={category.name}
              amount={amount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
