import AccountCard from "@/components/AccountCard";
import AddAccountSheet from "@/components/AddAccountSheet";
import type { TrendPoint } from "@/lib/networth";
import type { Account } from "@/lib/types";

export default function AccountsView({
  accounts,
  accountSeries,
  accountLastThreeMonths,
}: {
  accounts: Account[];
  accountSeries: TrendPoint[][];
  accountLastThreeMonths: { label: string; value: number }[][];
}) {
  return (
    <>
      {accounts.length === 0 ? (
        <p className="mt-8 text-center text-sm text-stone-400">
          No accounts yet. Add your first one below.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {accounts.map((account, i) => (
            <AccountCard
              key={account.id}
              account={account}
              series={accountSeries[i]}
              lastThreeMonths={accountLastThreeMonths[i]}
            />
          ))}
        </div>
      )}

      <AddAccountSheet />
    </>
  );
}
