import { getAccountHistory, getAccounts } from "@/lib/data";
import { accountTrendSeries, lastNMonthBalances } from "@/lib/networth";
import AccountCard from "@/components/AccountCard";
import AddAccountSheet from "@/components/AddAccountSheet";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const histories = await Promise.all(accounts.map((a) => getAccountHistory(a.id)));

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <p className="text-sm text-stone-500">
        Total net worth: <span className="font-medium text-stone-800">${netWorth.toLocaleString()}</span>
      </p>

      <AddAccountSheet />

      {accounts.length === 0 ? (
        <p className="mt-8 text-center text-sm text-stone-400">
          No accounts yet. Add your first one above.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account, i) => (
            <AccountCard
              key={account.id}
              account={account}
              series={accountTrendSeries(histories[i])}
              lastThreeMonths={lastNMonthBalances(histories[i])}
            />
          ))}
        </div>
      )}
    </div>
  );
}
