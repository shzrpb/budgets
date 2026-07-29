-- ─────────────────────────────────────────────────────────────
-- transaction_line_items: cost breakdown for a fixed transaction,
-- e.g. "Bills" split into "Phone" + "Utility". The parent
-- transaction's `amount` is kept as the sum of its line items
-- whenever any exist, so every existing budget/spend computation
-- (which reads transactions.amount) stays correct unchanged.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.transaction_line_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  transaction_id uuid not null references public.transactions (id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null check (amount > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists transaction_line_items_transaction_idx
  on public.transaction_line_items (transaction_id, sort_order);

alter table public.transaction_line_items enable row level security;

create policy "transaction_line_items_owner" on public.transaction_line_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.transaction_line_items to authenticated;
