-- Budget tracking app schema
-- Run this once in the Supabase SQL editor (or via `supabase db push`).

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- settings: one row per user, holds the monthly budget target
-- ─────────────────────────────────────────────────────────────
create table if not exists public.settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  monthly_budget numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- categories: seeded defaults + user-added ones
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  emoji text,
  color text not null default '#a8a29e',
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- ─────────────────────────────────────────────────────────────
-- accounts: income sources / savings, manually-edited balance
-- ─────────────────────────────────────────────────────────────
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null default 'checking'
    check (type in ('checking', 'savings', 'investment', 'cash', 'credit', 'other')),
  balance numeric(14, 2) not null default 0,
  color text not null default '#a8a29e',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- account_balance_history: append-only trend data for each account
-- ─────────────────────────────────────────────────────────────
create table if not exists public.account_balance_history (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  balance numeric(14, 2) not null,
  recorded_at timestamptz not null default now()
);

create index if not exists account_balance_history_account_idx
  on public.account_balance_history (account_id, recorded_at desc);

-- ─────────────────────────────────────────────────────────────
-- transactions: spends + income, one-off or fixed/recurring
-- ─────────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid references public.accounts (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  type text not null check (type in ('spend', 'income')),
  payment_method text check (payment_method in ('cash', 'credit')),
  note text,
  occurred_at date not null default current_date,
  is_fixed boolean not null default false,
  recurrence text not null default 'none'
    check (recurrence in ('none', 'monthly', 'yearly')),
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx
  on public.transactions (user_id, occurred_at desc);

-- ─────────────────────────────────────────────────────────────
-- goals: net-worth / savings goal shown on the home card
-- ─────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(14, 2) not null,
  target_date date,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Row Level Security: every table scoped to auth.uid()
-- ─────────────────────────────────────────────────────────────
alter table public.settings enable row level security;
alter table public.categories enable row level security;
alter table public.accounts enable row level security;
alter table public.account_balance_history enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;

create policy "settings_owner" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_owner" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "accounts_owner" on public.accounts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "account_balance_history_owner" on public.account_balance_history
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_owner" on public.transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────
-- Grants: RLS policies above control *which rows* a request can
-- touch, but Postgres also requires a baseline table-level grant
-- before the API roles can touch the table at all.
-- ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.settings,
  public.categories,
  public.accounts,
  public.account_balance_history,
  public.transactions,
  public.goals
to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Seed default categories + settings row for a new user.
-- Runs automatically whenever a new auth user is created.
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.categories (user_id, name, emoji, color)
  values
    (new.id, 'Food', '🍜', '#f97316'),
    (new.id, 'Shopping', '🛍️', '#ec4899'),
    (new.id, 'Gifts', '🎁', '#a855f7'),
    (new.id, 'Taxi', '🚕', '#eab308'),
    (new.id, 'PT', '🚇', '#0ea5e9'),
    (new.id, 'Drinks', '🍹', '#14b8a6'),
    (new.id, 'Groceries', '🛒', '#22c55e')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
