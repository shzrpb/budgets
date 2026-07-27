"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { GoalKind, PaymentMethod, Recurrence, TransactionType } from "@/lib/types";

export async function addTransaction(input: {
  amount: number;
  type: TransactionType;
  categoryId: string | null;
  accountId: string | null;
  paymentMethod: PaymentMethod | null;
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
    note: input.note ?? null,
    occurred_at: input.occurredAt ?? new Date().toISOString().slice(0, 10),
    is_fixed: input.isFixed ?? false,
    recurrence: input.recurrence ?? "none",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
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
  name: string;
  targetAmount: number;
  targetDate: string | null;
  kind?: GoalKind;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("goals").upsert({
    id: input.id,
    user_id: user.id,
    name: input.name,
    target_amount: input.targetAmount,
    target_date: input.targetDate,
    kind: input.kind ?? "custom",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/");
}

export async function addCategory(input: { name: string; color: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name: input.name,
    color: input.color,
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
