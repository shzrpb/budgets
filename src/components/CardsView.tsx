import CardItem from "@/components/CardItem";
import type { Card } from "@/lib/types";

export default function CardsView({
  cards,
  cardMonthSpend,
}: {
  cards: Card[];
  cardMonthSpend: Map<string, number>;
}) {
  if (cards.length === 0) {
    return <p className="mt-8 text-center text-sm text-stone-400">No cards yet. Add your first one above.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <CardItem key={card.id} card={card} monthSpend={cardMonthSpend.get(card.id) ?? 0} />
      ))}
    </div>
  );
}
