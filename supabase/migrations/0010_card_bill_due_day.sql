-- Optional bill due day (day-of-month, 1-31) per card, used to show a
-- reminder on the home screen in the week before the bill is due. Stored as
-- a day-of-month rather than a date since the due date moves every month.
-- Safe to re-run.

alter table public.cards
  add column if not exists bill_due_day smallint
    check (bill_due_day is null or (bill_due_day between 1 and 31));
