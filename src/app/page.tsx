import { getHomeData, getCurrentUserName } from "@/lib/data";
import { buildNetWorthSeries } from "@/lib/networth";
import NetWorthCard from "@/components/NetWorthCard";
import NetWorthGoalCard from "@/components/NetWorthGoalCard";
import MonthGlanceCard from "@/components/MonthGlanceCard";
import CardDueReminder from "@/components/CardDueReminder";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import DateTimeClock from "@/components/DateTimeClock";

export default async function Home() {
  const {
    accounts,
    accountClosures,
    history,
    categories,
    cards,
    cardOutstanding,
    netWorthGoal,
    monthTransactions,
    settings,
  } = await getHomeData();
  const userName = await getCurrentUserName();

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const series = buildNetWorthSeries(history, 6, accountClosures);

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }
  const overLimitCards = cards.filter(
    (c) => c.max_spend != null && (cardMonthSpend.get(c.id) ?? 0) > c.max_spend,
  );

  return (
    <div className="flex h-full flex-col gap-2.5 overflow-hidden px-4 pt-4 pb-24">
      <h1 className="pl-2 text-2xl font-semibold tracking-tight text-stone-900">
        Hello, {userName}
      </h1>
      <DateTimeClock />

      <NetWorthCard netWorth={netWorth} series={series} />
      <NetWorthGoalCard goal={netWorthGoal} netWorth={netWorth} />
      <CardDueReminder cards={cards} accounts={accounts} cardOutstanding={cardOutstanding} />
      <MonthGlanceCard
        transactions={monthTransactions}
        categories={categories}
        monthlyBudget={settings?.monthly_budget ?? 0}
        overLimitCards={overLimitCards}
      />

      <AddTransactionSheet categories={categories} accounts={accounts} cards={cards} />
    </div>
  );
}
