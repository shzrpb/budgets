import { getCards, getMonthTransactions } from "@/lib/data";
import CardsView from "@/components/CardsView";

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
      <p className="text-sm text-stone-500">
        Total spent: <span className="font-medium text-stone-800">${totalSpent.toLocaleString()}</span>
      </p>

      <CardsView cards={cards} cardMonthSpend={cardMonthSpend} />
    </div>
  );
}
