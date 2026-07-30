import { getAccountHistories, getAccounts } from "@/lib/data";
import { accountTrendSeries, lastNMonthBalances } from "@/lib/networth";
import AccountsView from "@/components/AccountsView";
import AddAccountSheet from "@/components/AddAccountSheet";
import PageHeader from "@/components/PageHeader";
import { formatMoney } from "@/lib/format";

export default async function AccountsPage() {
  const accounts = await getAccounts();
  const historyByAccount = await getAccountHistories(accounts.map((a) => a.id));
  const histories = accounts.map((a) => historyByAccount.get(a.id) ?? []);

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageHeader title="Accounts" />

      <div className="flex items-center justify-between pl-2">
        <p className="text-sm text-[var(--text-secondary)]">
          Total net worth:{" "}
          <span className="font-mono font-medium text-[var(--text-primary)]">${formatMoney(netWorth)}</span>
        </p>
        <AddAccountSheet />
      </div>

      <AccountsView
        accounts={accounts}
        accountSeries={histories.map((h) => accountTrendSeries(h))}
        accountLastThreeMonths={histories.map((h) => lastNMonthBalances(h))}
      />
    </div>
  );
}
