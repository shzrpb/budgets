import {
  getAccounts,
  getBalanceHistory,
  getCards,
  getCategories,
  getCustomGoal,
  getNetWorthGoal,
  getMonthTransactions,
  getSettings,
} from "@/lib/data";
import { buildNetWorthSeries } from "@/lib/networth";
import NetWorthCard from "@/components/NetWorthCard";
import NetWorthGoalCard from "@/components/NetWorthGoalCard";
import GoalCard from "@/components/GoalCard";
import MonthGlanceCard from "@/components/MonthGlanceCard";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import AddGoalFab from "@/components/AddGoalFab";
import DateTimeClock from "@/components/DateTimeClock";

export default async function Home() {
  const [accounts, history, categories, cards, netWorthGoal, customGoal, monthTransactions, settings] =
    await Promise.all([
      getAccounts(),
      getBalanceHistory(),
      getCategories(),
      getCards(),
      getNetWorthGoal(),
      getCustomGoal(),
      getMonthTransactions(),
      getSettings(),
    ]);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const series = buildNetWorthSeries(history);

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }
  const overLimitCards = cards.filter(
    (c) => c.max_spend != null && (cardMonthSpend.get(c.id) ?? 0) > c.max_spend,
  );

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <DateTimeClock />

      <NetWorthCard netWorth={netWorth} series={series} />
      <NetWorthGoalCard goal={netWorthGoal} netWorth={netWorth} />
      <GoalCard goal={customGoal} netWorth={netWorth} />
      <MonthGlanceCard
        transactions={monthTransactions}
        categories={categories}
        monthlyBudget={settings?.monthly_budget ?? 0}
        overLimitCards={overLimitCards}
      />

      <AddGoalFab goal={customGoal} />
      <AddTransactionSheet categories={categories} accounts={accounts} cards={cards} />
    </div>
  );
}
