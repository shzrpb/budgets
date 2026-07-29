import CategoryPill from "@/components/CategoryPill";
import type { Card, Category, Transaction } from "@/lib/types";

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "long" });

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
  const over = monthlyBudget > 0 && spent > monthlyBudget;

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
          {MONTH_LABEL.format(new Date())} at a glance
        </p>
        <p className="text-xs text-stone-400">
          ${spent.toLocaleString()} / ${monthlyBudget.toLocaleString()}
        </p>
      </div>
      <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all ${over ? "bg-red-400" : "bg-stone-800"}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

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
