import { getAccounts, getCards, getCategories, getRecentTransactions } from "@/lib/data";
import TransactionList from "@/components/TransactionList";
import AddFixedSheet from "@/components/AddFixedSheet";
import AddTransactionSheet from "@/components/AddTransactionSheet";

export default async function TransactionsPage() {
  const [transactions, categories, accounts, cards] = await Promise.all([
    getRecentTransactions(),
    getCategories(),
    getAccounts(),
    getCards(),
  ]);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <AddFixedSheet categories={categories} accounts={accounts} />

      <TransactionList transactions={transactions} categories={categories} accounts={accounts} cards={cards} />

      <AddTransactionSheet categories={categories} accounts={accounts} cards={cards} />
    </div>
  );
}
