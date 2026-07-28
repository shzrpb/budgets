import { getAccounts, getCards, getCategories, getRecentTransactions, getSettings } from "@/lib/data";
import TransactionList from "@/components/TransactionList";
import AddFixedSheet from "@/components/AddFixedSheet";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import MonthlyBudgetCard from "@/components/MonthlyBudgetCard";

export default async function TransactionsPage() {
  const [transactions, categories, accounts, cards, settings] = await Promise.all([
    getRecentTransactions(),
    getCategories(),
    getAccounts(),
    getCards(),
    getSettings(),
  ]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <MonthlyBudgetCard monthlyBudget={settings?.monthly_budget ?? 0} />

      <AddFixedSheet categories={categories} accounts={accounts} cards={cards} />

      <TransactionList transactions={transactions} categories={categories} accounts={accounts} cards={cards} />

      <AddTransactionSheet categories={categories} accounts={accounts} cards={cards} />
    </div>
  );
}
