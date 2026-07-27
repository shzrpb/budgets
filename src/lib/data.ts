import { createClient } from "@/lib/supabase/server";
import type {
  Account,
  AccountBalanceHistoryRow,
  Category,
  Goal,
  Settings,
  Transaction,
} from "@/lib/types";

export async function getAccounts(): Promise<Account[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("accounts").select("*").order("created_at");
  return (data as Account[]) ?? [];
}

export async function getBalanceHistory(months = 6): Promise<AccountBalanceHistoryRow[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const { data } = await supabase
    .from("account_balance_history")
    .select("*")
    .gte("recorded_at", since.toISOString())
    .order("recorded_at");
  return (data as AccountBalanceHistoryRow[]) ?? [];
}

export async function getAccountHistory(accountId: string): Promise<AccountBalanceHistoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("account_balance_history")
    .select("*")
    .eq("account_id", accountId)
    .order("recorded_at");
  return (data as AccountBalanceHistoryRow[]) ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("created_at");
  return (data as Category[]) ?? [];
}

export async function getSettings(): Promise<Settings | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("*").maybeSingle();
  return (data as Settings) ?? null;
}

export async function getCustomGoal(): Promise<Goal | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("kind", "custom")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Goal) ?? null;
}

export async function getNetWorthGoal(): Promise<Goal | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("kind", "net_worth")
    .maybeSingle();
  return (data as Goal) ?? null;
}

export async function getMonthTransactions(): Promise<Transaction[]> {
  const supabase = await createClient();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("type", "spend")
    .gte("occurred_at", start)
    .order("occurred_at", { ascending: false });
  return (data as Transaction[]) ?? [];
}

export async function getRecentTransactions(limit = 200): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Transaction[]) ?? [];
}
