-- Track when each card's bill was last paid, so the "Paid" action knows the
-- outstanding balance (credit spend since the last payment) instead of
-- double-charging an already-settled cycle. Safe to re-run.

alter table public.cards
  add column if not exists last_paid_at timestamptz;

create or replace function public.get_home_data(months integer default 6)
returns json
language sql
security invoker
stable
as $$
  select json_build_object(
    'accounts', (
      select coalesce(json_agg(row_to_json(a) order by a.created_at), '[]'::json)
      from public.accounts a
      where a.closed_at is null
    ),
    'account_closures', (
      select coalesce(json_agg(json_build_object('id', a.id, 'closed_at', a.closed_at)), '[]'::json)
      from public.accounts a
      where a.closed_at is not null
    ),
    'balance_history', (
      select coalesce(json_agg(row_to_json(h) order by h.recorded_at), '[]'::json)
      from public.account_balance_history h
      where h.recorded_at >= (now() - (months || ' months')::interval)
    ),
    'categories', (
      select coalesce(json_agg(row_to_json(c) order by c.created_at), '[]'::json)
      from public.categories c
    ),
    'cards', (
      select coalesce(json_agg(row_to_json(cd) order by cd.created_at), '[]'::json)
      from public.cards cd
    ),
    'card_outstanding', (
      -- Outstanding = unpaid credit spend on the card. Compared as text
      -- (not timestamptz) to match the app's own same-day-transaction
      -- handling: a transaction dated the same calendar day as the last
      -- payment is treated as already covered.
      select coalesce(json_agg(json_build_object(
        'card_id', cd.id,
        'outstanding', coalesce((
          select sum(t.amount)
          from public.transactions t
          where t.card_id = cd.id
            and t.payment_method = 'credit'
            and t.type = 'spend'
            and (cd.last_paid_at is null or t.occurred_at::text > cd.last_paid_at::text)
        ), 0)
      )), '[]'::json)
      from public.cards cd
    ),
    'net_worth_goal', (
      select row_to_json(g) from public.goals g where g.kind = 'net_worth' limit 1
    ),
    'custom_goal', (
      select row_to_json(g) from public.goals g
      where g.kind = 'custom' order by g.created_at desc limit 1
    ),
    'month_transactions', (
      select coalesce(json_agg(row_to_json(t) order by t.occurred_at desc), '[]'::json)
      from public.transactions t
      where t.type = 'spend'
        and t.occurred_at >= date_trunc('month', current_date)::date
    ),
    'settings', (
      select row_to_json(s) from public.settings s limit 1
    )
  );
$$;

grant execute on function public.get_home_data(integer) to authenticated;
