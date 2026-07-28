export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "cash"
  | "credit"
  | "other";

export type TransactionType = "spend" | "income";
export type PaymentMethod = "cash" | "credit";
export type Recurrence = "none" | "monthly" | "yearly";
export type GoalKind = "net_worth" | "custom";

export interface Settings {
  user_id: string;
  monthly_budget: number;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  updated_at: string;
  created_at: string;
}

export interface AccountBalanceHistoryRow {
  id: string;
  account_id: string;
  user_id: string;
  balance: number;
  recorded_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  name: string;
  color: string;
  max_spend: number | null;
  note: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string | null;
  category_id: string | null;
  card_id: string | null;
  amount: number;
  type: TransactionType;
  payment_method: PaymentMethod | null;
  note: string | null;
  occurred_at: string;
  is_fixed: boolean;
  recurrence: Recurrence;
  sort_order: number | null;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  kind: GoalKind;
  created_at: string;
}
