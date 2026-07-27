import {
  getAccounts,
  getBalanceHistory,
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
import Greeting from "@/components/Greeting";

export default async function Home() {
  const [accounts, history, categories, netWorthGoal, customGoal, monthTransactions, settings] =
    await Promise.all([
      getAccounts(),
      getBalanceHistory(),
      getCategories(),
      getNetWorthGoal(),
      getCustomGoal(),
      getMonthTransactions(),
      getSettings(),
    ]);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const series = buildNetWorthSeries(history);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <Greeting />

      <NetWorthCard netWorth={netWorth} series={series} />
      <NetWorthGoalCard goal={netWorthGoal} netWorth={netWorth} />
      <GoalCard goal={customGoal} netWorth={netWorth} />
      <MonthGlanceCard
        transactions={monthTransactions}
        categories={categories}
        monthlyBudget={settings?.monthly_budget ?? 0}
      />

      <AddTransactionSheet categories={categories} accounts={accounts} />
    </div>
  );
}
