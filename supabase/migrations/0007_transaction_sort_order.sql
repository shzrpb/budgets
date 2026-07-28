-- Lets fixed spends/income be manually reordered (drag-and-drop on the
-- transactions tab). Backfills existing rows in their current
-- occurred_at/created_at order so nothing jumps around on first load.
-- Safe to re-run.

alter table public.transactions
  add column if not exists sort_order integer;

with ranked as (
  select id, row_number() over (
    partition by user_id
    order by occurred_at desc, created_at desc
  ) as rn
  from public.transactions
  where is_fixed = true
)
update public.transactions t
set sort_order = ranked.rn
from ranked
where t.id = ranked.id
  and t.sort_order is null;

create index if not exists transactions_fixed_sort_idx
  on public.transactions (user_id, sort_order)
  where is_fixed = true;
