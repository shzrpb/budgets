import { getAccountHistory, getAccounts, getCards, getMonthTransactions } from "@/lib/data";
import { accountTrendSeries, lastNMonthBalances } from "@/lib/networth";
import AccountsView from "@/components/AccountsView";

export default async function AccountsPage() {
  const [accounts, cards, monthTransactions] = await Promise.all([
    getAccounts(),
    getCards(),
    getMonthTransactions(),
  ]);
  const histories = await Promise.all(accounts.map((a) => getAccountHistory(a.id)));

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);

  const cardMonthSpend = new Map<string, number>();
  for (const t of monthTransactions) {
    if (!t.card_id) continue;
    cardMonthSpend.set(t.card_id, (cardMonthSpend.get(t.card_id) ?? 0) + t.amount);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <p className="text-sm text-stone-500">
        Total net worth: <span className="font-medium text-stone-800">${netWorth.toLocaleString()}</span>
      </p>

      <AccountsView
        accounts={accounts}
        accountSeries={histories.map((h) => accountTrendSeries(h))}
        accountLastThreeMonths={histories.map((h) => lastNMonthBalances(h))}
        cards={cards}
        cardMonthSpend={cardMonthSpend}
      />
    </div>
  );
}
