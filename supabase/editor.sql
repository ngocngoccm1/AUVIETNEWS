-- THỜI BÁO VIỆT - ÂU: allowlisted editor publishing.
-- Run schema.sql first if the articles table does not exist.
begin;
create table if not exists public.editor_accounts (
 user_id uuid primary key references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.editor_accounts enable row level security;
revoke all on public.editor_accounts from anon, authenticated;
grant select on public.editor_accounts to authenticated;
drop policy if exists "Editors read own access" on public.editor_accounts;
create policy "Editors read own access" on public.editor_accounts
 for select to authenticated using (user_id = (select auth.uid()));
-- Clients cannot add themselves to this list. Manage it from SQL Editor only.
grant insert on public.articles to authenticated;
drop policy if exists "Editors publish articles" on public.articles;
create policy "Editors publish articles" on public.articles
 for insert to authenticated with check (
 exists (select 1 from public.editor_accounts where user_id = (select auth.uid()))
 );
commit;
notify pgrst, 'reload schema';

-- Grant publishing access after creating an account under Authentication > Users:
-- insert into public.editor_accounts(user_id)
-- select id from auth.users where lower(email) = lower('YOUR_EDITOR_EMAIL');
-- Remove access:
-- delete from public.editor_accounts where user_id = 'EDITOR_USER_UUID';
