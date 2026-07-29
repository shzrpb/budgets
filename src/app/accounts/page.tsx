import { getAccountHistories, getAccounts } from "@/lib/data";
import { accountTrendSeries, lastNMonthBalances } from "@/lib/networth";
import AccountsView from "@/components/AccountsView";
import PageHeader from "@/components/PageHeader";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const historyByAccount = await getAccountHistories(accounts.map((a) => a.id));
  const histories = accounts.map((a) => historyByAccount.get(a.id) ?? []);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageHeader title="Accounts" />

      <p className="pl-2 text-sm text-stone-500">
        Total net worth: <span className="font-medium text-stone-800">${netWorth.toLocaleString()}</span>
      </p>

      <AccountsView
        accounts={accounts}
        accountSeries={histories.map((h) => accountTrendSeries(h))}
        accountLastThreeMonths={histories.map((h) => lastNMonthBalances(h))}
      />
    </div>
  );
}
