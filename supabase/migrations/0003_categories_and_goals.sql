-- Softer category colors, a Bills category, dropping the emoji
-- column, and a distinct "net worth goal" separate from named goals.
-- Safe to re-run.

update public.categories set color = '#e8a87c' where name = 'Food';
update public.categories set color = '#d8a7ca' where name = 'Shopping';
update public.categories set color = '#b8a4d4' where name = 'Gifts';
update public.categories set color = '#e3c16f' where name = 'Taxi';
update public.categories set color = '#8fb8c9' where name = 'PT';
update public.categories set color = '#7fc9b9' where name = 'Drinks';
update public.categories set color = '#9bc99b' where name = 'Groceries';

insert into public.categories (user_id, name, color)
select id, 'Bills', '#c9a88a' from auth.users
on conflict (user_id, name) do nothing;

alter table public.categories drop column if exists emoji;

alter table public.goals
  add column if not exists kind text not null default 'custom'
    check (kind in ('net_worth', 'custom'));

create unique index if not exists goals_one_net_worth_per_user
  on public.goals (user_id) where (kind = 'net_worth');

-- Update the new-user seed function to match: no emoji, add Bills,
-- lighter colors.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.categories (user_id, name, color)
  values
    (new.id, 'Food', '#e8a87c'),
    (new.id, 'Shopping', '#d8a7ca'),
    (new.id, 'Gifts', '#b8a4d4'),
    (new.id, 'Taxi', '#e3c16f'),
    (new.id, 'PT', '#8fb8c9'),
    (new.id, 'Drinks', '#7fc9b9'),
    (new.id, 'Groceries', '#9bc99b'),
    (new.id, 'Bills', '#c9a88a')
  on conflict (user_id, name) do nothing;

  return new;
end;
$$;
