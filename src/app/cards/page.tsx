import { getCards, getMonthTransactions } from "@/lib/data";
import CardsView from "@/components/CardsView";

export default async function CardsPage() {
  const [cards, monthTransactions] = await Promise.all([getCards(), getMonthTransactions()]);

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <CardsView cards={cards} cardMonthSpend={cardMonthSpend} />
    </div>
  );
}
