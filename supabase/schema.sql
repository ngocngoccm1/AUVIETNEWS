-- THỜI BÁO VIỆT - ÂU | Run in Supabase SQL Editor before seed.sql.
-- Re-runnable: creates tables and replaces named policies without dropping data.
begin;
create extension if not exists pgcrypto;
create table if not exists public.articles (
 id uuid primary key default gen_random_uuid(),
 slug text unique not null,
 category text not null,
 subcategory text,
 cover_image text check (cover_image is null or cover_image like 'https://ik.imagekit.io/%'),
 author text default 'Ban Biên Tập',
 published_at timestamptz default now(),
 reading_time int default 5 check (reading_time > 0),
 views int default 0 check (views >= 0),
 featured boolean default false,
 title_vi text not null,
 title_en text,
 title_de text,
 excerpt_vi text,
 excerpt_en text,
 excerpt_de text,
 content_vi text,
 content_en text,
 content_de text
);
create table if not exists public.comments (
 id uuid primary key default gen_random_uuid(),
 article_id uuid not null references public.articles(id) on delete cascade,
 author_name text not null check (char_length(trim(author_name)) between 1 and 100),
 content text not null check (char_length(trim(content)) between 2 and 3000),
 created_at timestamptz default now()
);
create table if not exists public.likes (
 id uuid primary key default gen_random_uuid(),
 article_id uuid not null references public.articles(id) on delete cascade,
 anonymous_id text not null check (char_length(anonymous_id) between 1 and 100),
 created_at timestamptz default now(),
 unique(article_id, anonymous_id)
);
create table if not exists public.newsletter_subscribers (
 id uuid primary key default gen_random_uuid(),
 email text unique not null check (char_length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 locale text default 'vi' check (locale in ('vi','en','de')),
 created_at timestamptz default now()
);
create table if not exists public.story_submissions (
 id uuid primary key default gen_random_uuid(),
 author_name text not null check (char_length(trim(author_name)) between 1 and 100),
 email text check (email is null or char_length(email) <= 254),
 title text check (title is null or char_length(title) <= 200),
 content text not null check (char_length(trim(content)) between 20 and 15000),
 created_at timestamptz default now()
);
create index if not exists articles_category_date_idx on public.articles(category,published_at desc);
create index if not exists articles_date_idx on public.articles(published_at desc);
create index if not exists comments_article_idx on public.comments(article_id,created_at desc);
create index if not exists likes_article_idx on public.likes(article_id);
alter table public.articles enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.story_submissions enable row level security;

drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles for select to anon, authenticated using (true);
drop policy if exists "Public read comments" on public.comments;
create policy "Public read comments" on public.comments for select to anon, authenticated using (true);
drop policy if exists "Public insert comments" on public.comments;
create policy "Public insert comments" on public.comments for insert to anon, authenticated with check (true);
drop policy if exists "Public read likes" on public.likes;
create policy "Public read likes" on public.likes for select to anon, authenticated using (true);
drop policy if exists "Public insert likes" on public.likes;
create policy "Public insert likes" on public.likes for insert to anon, authenticated with check (true);
-- Anonymous IDs are a UX identifier, not authenticated ownership. This follows
-- the requested public model; see README before using likes in a public launch.
drop policy if exists "Public delete likes" on public.likes;
create policy "Public delete likes" on public.likes for delete to anon, authenticated using (true);
drop policy if exists "Public insert newsletter" on public.newsletter_subscribers;
create policy "Public insert newsletter" on public.newsletter_subscribers for insert to anon, authenticated with check (true);
drop policy if exists "Public insert submissions" on public.story_submissions;
create policy "Public insert submissions" on public.story_submissions for insert to anon, authenticated with check (true);

-- Public clients cannot edit/delete articles or read subscriber/submission data.
revoke all on public.articles, public.comments, public.likes, public.newsletter_subscribers, public.story_submissions from anon, authenticated;
grant usage on schema public to anon, authenticated;
grant select on public.articles to anon, authenticated;
grant select, insert on public.comments to anon, authenticated;
grant select, insert, delete on public.likes to anon, authenticated;
grant insert on public.newsletter_subscribers, public.story_submissions to anon, authenticated;

-- Publishing is restricted to editor accounts managed by the project owner.
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
