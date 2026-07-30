import { getCards, getMonthTransactions } from "@/lib/data";
import AddCardSheet from "@/components/AddCardSheet";
import CardsView from "@/components/CardsView";
import PageHeader from "@/components/PageHeader";
import { formatMoney } from "@/lib/format";

export default async function CardsPage() {
  const [cards, monthTransactions] = await Promise.all([getCards(), getMonthTransactions()]);

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }

  const totalSpent = [...cardMonthSpend.values()].reduce((sum, v) => sum + v, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageHeader title="Cards" />

      <div className="flex items-center justify-between pl-2">
        <p className="text-sm text-[var(--text-secondary)]">
          Total spent:{" "}
          <span className="font-mono font-medium text-[var(--text-primary)]">${formatMoney(totalSpent)}</span>
        </p>
        <AddCardSheet />
      </div>

      <CardsView cards={cards} cardMonthSpend={cardMonthSpend} />
    </div>
  );
}
