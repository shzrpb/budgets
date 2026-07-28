-- Credit cards: track which specific card a credit spend was put on,
-- with an optional monthly max-spend limit per card (to help spread
-- spend across cards and maximise miles). Safe to re-run.

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#a8a29e',
  max_spend numeric(12, 2),
  created_at timestamptz not null default now()
);

alter table public.transactions
  add column if not exists card_id uuid references public.cards (id) on delete set null;

alter table public.cards enable row level security;

drop policy if exists "cards_owner" on public.cards;
create policy "cards_owner" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.cards
to authenticated;
