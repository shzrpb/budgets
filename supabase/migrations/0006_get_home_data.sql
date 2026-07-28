-- Bundles every read the Home page needs into a single round-trip.
-- Runs as the calling role (not security definer), so existing RLS
-- policies on each table still apply exactly as before. Safe to re-run.

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
