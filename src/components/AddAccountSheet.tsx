"use client";

import { useState, useTransition } from "react";
import { addAccount, updateAccount } from "@/app/actions";
import { PlusIcon } from "@/components/icons";
import { useRegisterSheetOpen } from "@/lib/sheetVisibility";
import { useVisualViewportInsets } from "@/lib/useVisualViewport";
import type { Account, AccountType } from "@/lib/types";

const TYPES: AccountType[] = ["checking", "savings", "investment", "cash", "credit", "other"];
/** Accounts no longer expose a color picker; every new account gets this neutral tint. */
const DEFAULT_COLOR = "#57534e";

export default function AddAccountSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Add account"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-stone-100"
      >
        <PlusIcon />
      </button>
      {open && <AccountSheetForm onClose={() => setOpen(false)} />}
    </>
  );
}

export function EditAccountSheet({
  account,
  onClose,
}: {
  account: Account;
  onClose: () => void;
}) {
  return <AccountSheetForm account={account} onClose={onClose} />;
}

function AccountSheetForm({ account, onClose }: { account?: Account; onClose: () => void }) {
  useRegisterSheetOpen(true);
  const { height: viewportHeight, top: viewportTop } = useVisualViewportInsets();
  const isEdit = !!account;
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(account?.type ?? "checking");
  const [balance, setBalance] = useState(account?.balance.toString() ?? "");
  const [isPending, startTransition] = useTransition();

  const canSave = name.trim().length > 0 && balance !== "";

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      const input = { name: name.trim(), type, balance: Number(balance), color: account?.color ?? DEFAULT_COLOR };
      if (isEdit) await updateAccount(account!.id, input);
      else await addAccount(input);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-x-0 z-50 flex items-center justify-center bg-black/40 p-4"
      style={{ top: viewportTop, height: viewportHeight ?? "100dvh" }}
    >
      <div className="flex max-h-full w-full max-w-md flex-col overflow-y-auto overscroll-contain rounded-3xl bg-white p-5 shadow-xl">
        <p className="text-sm font-semibold text-stone-800">
          {isEdit ? "Edit account" : "Add account"}
        </p>

        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Everyday checking"
          className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none focus:border-stone-400"
        />

        <p className="mt-4 text-xs font-medium text-stone-400">Type</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`rounded-full px-3 py-1.5 text-sm capitalize transition-colors ${
                type === t
                  ? "bg-stone-900 text-white"
                  : "bg-white text-stone-700 ring-1 ring-inset ring-stone-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs font-medium text-stone-400">
          {isEdit ? "Current balance" : "Starting balance"}
        </p>
        <div className="mt-2 flex items-center rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
          <span className="text-stone-400">$</span>
          <input
            inputMode="decimal"
            value={balance}
            onChange={(e) => setBalance(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="0.00"
            className="ml-1 w-full bg-transparent text-sm outline-none"
          />
        </div>

        <div className="mt-5 grid grid-cols-5 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="col-span-2 rounded-2xl bg-stone-100 py-3.5 text-sm font-medium text-stone-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave || isPending}
            onClick={handleSave}
            className="col-span-3 rounded-2xl bg-stone-900 py-3.5 text-sm font-medium text-white transition-colors disabled:opacity-40"
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Save account"}
          </button>
        </div>
      </div>
    </div>
  );
}
