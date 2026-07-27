"use client";

import { useState, useTransition } from "react";
import { addBalanceHistoryEntry, updateAccountBalance } from "@/app/actions";
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
        <div>
          <p className="text-sm font-medium text-stone-800">{account.name}</p>
          <p className="text-xs capitalize text-stone-400">{account.type}</p>
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
          <TrendChart data={series} color={account.color} height={90} showAxis={false} />
          <div className="mt-2 flex justify-between text-xs text-stone-500">
            {lastThreeMonths.map((m) => (
              <div key={m.label} className="text-center">
                <p className="text-stone-400">{m.label}</p>
                <p className="font-medium text-stone-700">${m.value.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <PastBalanceForm accountId={account.id} />
        </div>
      )}
    </div>
  );
}

function PastBalanceForm({ accountId }: { accountId: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [isPending, startTransition] = useTransition();

  const canSave = Number(amount) > 0 && date;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await addBalanceHistoryEntry(accountId, Number(amount), date);
      setOpen(false);
      setAmount("");
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 text-xs font-medium text-stone-400 underline decoration-stone-300 underline-offset-2"
      >
        + Add a past month&apos;s balance
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-stone-50 p-3">
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={date.slice(0, 7)}
          onChange={(e) => setDate(`${e.target.value}-01`)}
          className="w-[9.5rem] shrink-0 rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-stone-400"
        />
        <div className="flex flex-1 items-center rounded-xl border border-stone-200 bg-white px-3 py-2">
          <span className="text-stone-400">$</span>
          <input
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="ml-1 w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="mt-2 flex justify-end gap-3">
        <button type="button" onClick={() => setOpen(false)} className="text-xs text-stone-400">
          Cancel
        </button>
        <button
          type="button"
          disabled={!canSave || isPending}
          onClick={handleSave}
          className="text-xs font-medium text-stone-800 disabled:opacity-40"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
