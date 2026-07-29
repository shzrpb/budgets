import {
  getAccounts,
  getCards,
  getCategories,
  getLineItems,
  getMonthTransactions,
  getRecentTransactions,
  getSettings,
} from "@/lib/data";
import TransactionList from "@/components/TransactionList";
import MonthlyBudgetCard from "@/components/MonthlyBudgetCard";
import AddTransactionSheet from "@/components/AddTransactionSheet";
import PageHeader from "@/components/PageHeader";

export default async function TransactionsPage() {
  const [transactions, categories, accounts, cards, settings, monthTransactions, lineItems] =
    await Promise.all([
      getRecentTransactions(),
      getCategories(),
      getAccounts(),
      getCards(),
      getSettings(),
      getMonthTransactions(),
      getLineItems(),
    ]);

  const spent = monthTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageHeader title="Transactions" />

      <MonthlyBudgetCard monthlyBudget={settings?.monthly_budget ?? 0} spent={spent} />

      <TransactionList
        transactions={transactions}
        categories={categories}
        accounts={accounts}
        cards={cards}
        lineItems={lineItems}
      />

      <AddTransactionSheet
        categories={categories}
        accounts={accounts}
        cards={cards}
        monthlyBudget={settings?.monthly_budget ?? 0}
        spent={spent}
        transactionCount={monthTransactions.length}
      />

      <div className="h-16" />
    </div>
  );
}
