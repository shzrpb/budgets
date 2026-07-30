import { getHomeData, getCurrentUserName } from "@/lib/data";
import { buildNetWorthSeries, netWorthAsOf, hasHistoryAtOrBefore } from "@/lib/networth";
import NetWorthCard from "@/components/NetWorthCard";
import MonthGlanceCard from "@/components/MonthGlanceCard";
import CardDueReminder from "@/components/CardDueReminder";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import DateTimeClock from "@/components/DateTimeClock";

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

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

  const thirtyDaysAgo = daysAgo(30);
  const change30d = hasHistoryAtOrBefore(history, thirtyDaysAgo)
    ? netWorth - netWorthAsOf(history, thirtyDaysAgo, accountClosures)
    : null;

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }
  const overLimitCards = cards.filter(
    (c) => c.max_spend != null && (cardMonthSpend.get(c.id) ?? 0) > c.max_spend,
  );
  const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-2.5 px-4 pt-4">
      <h1 className="pl-2 text-2xl font-semibold tracking-tight text-stone-900">
        Hello, {userName}
      </h1>
      <DateTimeClock />

      <NetWorthCard netWorth={netWorth} series={series} change30d={change30d} goal={netWorthGoal} />
      <CardDueReminder cards={cards} accounts={accounts} cardOutstanding={cardOutstanding} />
      <MonthGlanceCard
        transactions={monthTransactions}
        categories={categories}
        monthlyBudget={settings?.monthly_budget ?? 0}
        overLimitCards={overLimitCards}
      />

      <AddTransactionSheet
        categories={categories}
        accounts={accounts}
        cards={cards}
        monthlyBudget={settings?.monthly_budget ?? 0}
        spent={spent}
        transactionCount={monthTransactions.length}
      />
    </div>
  );
}
