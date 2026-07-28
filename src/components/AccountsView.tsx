"use client";

import { useState } from "react";
import AccountCard from "@/components/AccountCard";
import AddAccountSheet from "@/components/AddAccountSheet";
import AddCardSheet from "@/components/AddCardSheet";
import CardItem from "@/components/CardItem";
import type { TrendPoint } from "@/lib/networth";
import type { Account, Card } from "@/lib/types";

export default function AccountsView({
  accounts,
  accountSeries,
  accountLastThreeMonths,
  cards,
  cardMonthSpend,
}: {
  accounts: Account[];
  accountSeries: TrendPoint[][];
  accountLastThreeMonths: { label: string; value: number }[][];
  cards: Card[];
  cardMonthSpend: Map<string, number>;
}) {
  const [tab, setTab] = useState<"accounts" | "cards">("accounts");

  return (
    <>
      <div className="flex rounded-full bg-stone-100 p-1">
        <button
          type="button"
          onClick={() => setTab("accounts")}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "accounts" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
          }`}
        >
          Accounts
        </button>
        <button
          type="button"
          onClick={() => setTab("cards")}
          className={`flex-1 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "cards" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"
          }`}
        >
          Cards
        </button>
      </div>

      {tab === "accounts" ? (
        <>
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
                  series={accountSeries[i]}
                  lastThreeMonths={accountLastThreeMonths[i]}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <AddCardSheet />

          {cards.length === 0 ? (
            <p className="mt-8 text-center text-sm text-stone-400">
              No cards yet. Add your first one above.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cards.map((card) => (
                <CardItem key={card.id} card={card} monthSpend={cardMonthSpend.get(card.id) ?? 0} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
