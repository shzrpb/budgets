-- Fixes "permission denied for table X" errors: RLS policies control
-- which rows a request can see, but Postgres also needs a baseline
-- table-level grant before the authenticated role can touch a table
-- at all. Safe to re-run.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on
  public.settings,
  public.categories,
  public.accounts,
  public.account_balance_history,
  public.transactions,
  public.goals
to authenticated;
