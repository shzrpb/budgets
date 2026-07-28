"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod, Recurrence, TransactionType } from "@/lib/types";

export async function addTransaction(input: {
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  accountId: string | null;
  paymentMethod: PaymentMethod | null;
  cardId?: string | null;
  note?: string;
  occurredAt?: string;
  isFixed?: boolean;
  recurrence?: Recurrence;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    amount: input.amount,
    type: input.type,
    category_id: input.categoryId,
    account_id: input.accountId,
    payment_method: input.paymentMethod,
    card_id: input.paymentMethod === "credit" ? input.cardId ?? null : null,
    note: input.note ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString().slice(0, 10),
    is_fixed: input.isFixed ?? false,
    recurrence: input.recurrence ?? "none",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function updateTransaction(
  id: string,
  input: {
    amount: number;
    type: TransactionType;
    categoryId: string | null;
    accountId: string | null;
    paymentMethod: PaymentMethod | null;
    cardId?: string | null;
    note?: string;
    occurredAt?: string;
    recurrence?: Recurrence;
  },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({
      amount: input.amount,
      type: input.type,
      category_id: input.categoryId,
      account_id: input.accountId,
      payment_method: input.paymentMethod,
      card_id: input.paymentMethod === "credit" ? input.cardId ?? null : null,
      note: input.note ?? null,
      occurred_at: input.occurredAt ?? new Date().toISOString().slice(0, 10),
      recurrence: input.recurrence ?? "none",
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function reorderFixedTransactions(orderedIds: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("transactions")
        .update({ sort_order: index })
        .eq("id", id)
        .eq("user_id", user.id),
    ),
  );

  revalidatePath("/transactions");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function addAccount(input: {
  name: string;
  type: string;
  balance: number;
  color: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: account, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      balance: input.balance,
      color: input.color,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  await supabase.from("account_balance_history").insert({
    account_id: account.id,
    user_id: user.id,
    balance: input.balance,
  });

  revalidatePath("/");
  revalidatePath("/accounts");
}

export async function updateAccountBalance(accountId: string, balance: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("accounts")
    .update({ balance, updated_at: new Date().toISOString() })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  await supabase.from("account_balance_history").insert({
    account_id: accountId,
    user_id: user.id,
    balance,
  });

  revalidatePath("/");
  revalidatePath("/accounts");
}

export async function updateAccount(
  accountId: string,
  input: { name: string; type: string; color: string; balance: number },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: existing } = await supabase
    .from("accounts")
    .select("balance")
    .eq("id", accountId)
    .single();

  const { error } = await supabase
    .from("accounts")
    .update({
      name: input.name,
      type: input.type,
      color: input.color,
      balance: input.balance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  // Only snapshot history when the balance actually moved, so renaming or
  // recolouring an account doesn't pollute the trend chart.
  if (existing && existing.balance !== input.balance) {
    await supabase.from("account_balance_history").insert({
      account_id: accountId,
      user_id: user.id,
      balance: input.balance,
    });
  }

  revalidatePath("/");
  revalidatePath("/accounts");
}

/**
 * Closes an account rather than deleting the row. Balance history cascades
 * off accounts, so a hard delete would retroactively erase the months you
 * genuinely held that money. The account drops out of every list and out of
 * today's net worth; past months keep their balances.
 */
export async function deleteAccount(accountId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("accounts")
    .update({ closed_at: new Date().toISOString() })
    .eq("id", accountId);
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
}

export async function addBalanceHistoryEntry(
  accountId: string,
  balance: number,
  recordedAt: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const recordedAtIso = new Date(recordedAt).toISOString();

  const { error: insertError } = await supabase.from("account_balance_history").insert({
    account_id: accountId,
    user_id: user.id,
    balance,
    recorded_at: recordedAtIso,
  });
  if (insertError) throw new Error(insertError.message);

  const { data: latest } = await supabase
    .from("account_balance_history")
    .select("recorded_at")
    .eq("account_id", accountId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest?.recorded_at === recordedAtIso) {
    const { error: updateError } = await supabase
      .from("accounts")
      .update({ balance, updated_at: recordedAtIso })
      .eq("id", accountId);
    if (updateError) throw new Error(updateError.message);
  }

  revalidatePath("/");
  revalidatePath("/accounts");
}

export async function addCard(input: {
  name: string;
  color: string;
  maxSpend: number | null;
  note?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("cards").insert({
    user_id: user.id,
    name: input.name,
    color: input.color,
    max_spend: input.maxSpend,
    note: input.note ?? null,
  });
  if (error) throw new Error(error.message);

  revalidateCards();
}

export async function updateCard(
  cardId: string,
  input: { name: string; color: string; maxSpend: number | null; note?: string | null },
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({
      name: input.name,
      color: input.color,
      max_spend: input.maxSpend,
      note: input.note ?? null,
    })
    .eq("id", cardId);
  if (error) throw new Error(error.message);

  revalidateCards();
}

export async function updateCardMaxSpend(cardId: string, maxSpend: number | null) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cards")
    .update({ max_spend: maxSpend })
    .eq("id", cardId);
  if (error) throw new Error(error.message);

  revalidateCards();
}

export async function deleteCard(cardId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) throw new Error(error.message);

  revalidateCards();
}

function revalidateCards() {
  revalidatePath("/");
  revalidatePath("/cards");
  revalidatePath("/transactions");
}

export async function updateMonthlyBudget(monthlyBudget: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase
    .from("settings")
    .upsert({ user_id: user.id, monthly_budget: monthlyBudget, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function upsertGoal(input: {
  id?: string;
  targetAmount: number;
  targetDate: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("goals").upsert({
    id: input.id,
    user_id: user.id,
    name: "Net worth goal",
    target_amount: input.targetAmount,
    target_date: input.targetDate,
    kind: "net_worth",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function addCategory(input: { name: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: input.name,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/transactions");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
}
