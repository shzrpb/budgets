-- ─────────────────────────────────────────────────────────────
-- categories.is_fixed: fixed transactions (rent, subscriptions,
-- salary…) draw from a different, smaller category set than daily
-- spend — this flags which categories should appear in that picker.
-- ─────────────────────────────────────────────────────────────
alter table public.categories add column if not exists is_fixed boolean not null default false;

-- Existing "Bills" categories are equally at home in both pickers.
update public.categories set is_fixed = true where name = 'Bills';

-- Backfill the rest of the default fixed set for every existing user,
-- mirroring what handle_new_user now gives new users below.
insert into public.categories (user_id, name, color, is_fixed)
select u.id, c.name, c.color, true
from auth.users u
cross join (
  values
    ('Subscriptions', '#b8a4d4'),
    ('Parents', '#e8a87c'),
    ('Insurance', '#8fb8c9'),
    ('Taxes', '#e3c16f')
) as c(name, color)
on conflict (user_id, name) do update set is_fixed = true;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.categories (user_id, name, color, is_fixed)
  values
    (new.id, 'Food', '#e8a87c', false),
    (new.id, 'Shopping', '#d8a7ca', false),
    (new.id, 'Gifts', '#b8a4d4', false),
    (new.id, 'Taxi', '#e3c16f', false),
    (new.id, 'PT', '#8fb8c9', false),
    (new.id, 'Drinks', '#7fc9b9', false),
    (new.id, 'Groceries', '#9bc99b', false),
    (new.id, 'Bills', '#c9a88a', true),
    (new.id, 'Subscriptions', '#b8a4d4', true),
    (new.id, 'Parents', '#e8a87c', true),
    (new.id, 'Insurance', '#8fb8c9', true),
    (new.id, 'Taxes', '#e3c16f', true)
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;
