import {
  getAccounts,
  getBalanceHistory,
  getCategories,
  getGoal,
  getMonthTransactions,
  getSettings,
} from "@/lib/data";
import { buildNetWorthSeries } from "@/lib/networth";
import NetWorthCard from "@/components/NetWorthCard";
import GoalCard from "@/components/GoalCard";
import MonthGlanceCard from "@/components/MonthGlanceCard";
import AddTransactionSheet from "@/components/AddTransactionSheet";

export default async function Home() {
  const [accounts, history, categories, goal, monthTransactions, settings] = await Promise.all([
    getAccounts(),
    getBalanceHistory(),
    getCategories(),
    getGoal(),
    getMonthTransactions(),
    getSettings(),
  ]);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const series = buildNetWorthSeries(history);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold text-stone-900">Hi there</h1>

      <NetWorthCard netWorth={netWorth} series={series} />
      <GoalCard goal={goal} netWorth={netWorth} />
      <MonthGlanceCard
        transactions={monthTransactions}
        categories={categories}
        monthlyBudget={settings?.monthly_budget ?? 0}
      />

      <AddTransactionSheet categories={categories} accounts={accounts} />
    </div>
  );
}
