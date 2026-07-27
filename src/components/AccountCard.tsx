"use client";

import { useState, useTransition } from "react";
import { updateAccountBalance } from "@/app/actions";
import TrendChart from "@/components/TrendChart";
import type { TrendPoint } from "@/lib/networth";
import type { Account } from "@/lib/types";

export default function AccountCard({
  account,
  series,
  lastThreeMonths,
}: {
  account: Account;
  series: TrendPoint[];
  lastThreeMonths: { label: string; value: number }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(account.balance.toString());
  const [isPending, startTransition] = useTransition();

  function save() {
    const value = Number(draft);
    if (Number.isNaN(value)) {
      setEditing(false);
      return;
    }
    startTransition(() => updateAccountBalance(account.id, value));
    setEditing(false);
  }

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: account.color }}
          />
          <div>
            <p className="text-sm font-medium text-stone-800">{account.name}</p>
            <p className="text-xs capitalize text-stone-400">{account.type}</p>
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-1">
            <span className="text-stone-400">$</span>
            <input
              autoFocus
              inputMode="decimal"
              value={draft}
              onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
              onBlur={save}
              onKeyDown={(e) => e.key === "Enter" && save()}
              className="w-24 rounded-lg border border-stone-200 px-2 py-1 text-right text-sm outline-none focus:border-stone-400"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(account.balance.toString());
              setEditing(true);
            }}
            disabled={isPending}
            className="text-lg font-semibold tracking-tight text-stone-900"
          >
            ${account.balance.toLocaleString()}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-medium text-stone-400"
      >
        {expanded ? "Hide trend ↑" : "Show trend ↓"}
      </button>

      {expanded && (
        <div className="mt-3">
          <TrendChart data={series} color={account.color} height={90} />
          <div className="mt-2 flex justify-between text-xs text-stone-500">
            {lastThreeMonths.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-stone-400">{m.label}</p>
                <p className="font-medium text-stone-700">${m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
