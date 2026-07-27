import { getAccounts, getCategories, getRecentTransactions } from "@/lib/data";
import TransactionList from "@/components/TransactionList";
import AddFixedSheet from "@/components/AddFixedSheet";
import AddTransactionSheet from "@/components/AddTransactionSheet";

export default async function TransactionsPage() {
  const [transactions, categories, accounts] = await Promise.all([
    getRecentTransactions(),
    getCategories(),
    getAccounts(),
  ]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <h1 className="text-lg font-semibold text-stone-900">Transactions</h1>

      <AddFixedSheet categories={categories} accounts={accounts} />

      <TransactionList transactions={transactions} categories={categories} accounts={accounts} />

      <AddTransactionSheet categories={categories} accounts={accounts} />
    </div>
  );
}
