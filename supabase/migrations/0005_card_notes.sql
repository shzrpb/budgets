-- Short free-text note per card (e.g. "5x miles on dining"). Safe to re-run.

alter table public.cards
  add column if not exists note text;
