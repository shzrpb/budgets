-- Closing an account instead of deleting it.
--
-- Balance history hangs off accounts with `on delete cascade`, so a hard
-- delete silently rewrote past net worth: the months where you genuinely
-- held that money lost it retroactively. Keeping the account row as a
-- tombstone preserves the history *and* keeps it grouped by account, which
-- nulling out account_id would not (every closed account's rows would
-- collapse into a single bucket and overwrite each other).
--
-- Reads filter on `closed_at is null`; the net worth series stops carrying
-- a closed account's balance forward past its closure date.

alter table public.accounts
  add column if not exists closed_at timestamptz;

create index if not exists accounts_open_idx
  on public.accounts (user_id, created_at)
  where closed_at is null;
