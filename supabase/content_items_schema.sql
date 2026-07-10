-- Run this file manually in the Supabase SQL editor after reviewing it.
-- It is intentionally not executed by the application or build process.

create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.is_content_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_content_admin() from public;
grant execute on function public.is_content_admin() to anon, authenticated;

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (content_type in (
    'nouns',
    'verbs',
    'grammar',
    'kids_vocabulary',
    'kids_conversations',
    'kids_verbs',
    'kids_exercises',
    'kids_topics',
    'custom_quizzes'
  )),
  level text,
  topic text,
  title text,
  slug text,
  content jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  is_published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_type_published_idx
  on public.content_items (content_type, is_published);
create index if not exists content_items_level_idx on public.content_items (level);
create index if not exists content_items_topic_idx on public.content_items (topic);

create or replace function public.set_content_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_content_items_updated_at on public.content_items;
create trigger set_content_items_updated_at
before update on public.content_items
for each row execute function public.set_content_updated_at();

alter table public.content_items enable row level security;

drop policy if exists "Public reads published content" on public.content_items;
create policy "Public reads published content"
on public.content_items for select
using (is_published = true or public.is_content_admin());

drop policy if exists "Admins insert content" on public.content_items;
create policy "Admins insert content"
on public.content_items for insert
with check (public.is_content_admin());

drop policy if exists "Admins update content" on public.content_items;
create policy "Admins update content"
on public.content_items for update
using (public.is_content_admin())
with check (public.is_content_admin());

drop policy if exists "Admins delete content" on public.content_items;
create policy "Admins delete content"
on public.content_items for delete
using (public.is_content_admin());

-- Keep the four existing text-content tables and add publication metadata.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['exercises', 'vocabulary', 'exams', 'placement_tests']
  loop
    if to_regclass('public.' || table_name) is not null then
      execute format('alter table public.%I add column if not exists is_published boolean not null default true', table_name);
      execute format('alter table public.%I add column if not exists created_by uuid references auth.users(id) on delete set null default auth.uid()', table_name);
      execute format('alter table public.%I enable row level security', table_name);
      execute format('drop policy if exists "Public reads published rows" on public.%I', table_name);
      execute format('create policy "Public reads published rows" on public.%I for select using (is_published = true or public.is_content_admin())', table_name);
      execute format('drop policy if exists "Admins insert rows" on public.%I', table_name);
      execute format('create policy "Admins insert rows" on public.%I for insert with check (public.is_content_admin())', table_name);
      execute format('drop policy if exists "Admins update rows" on public.%I', table_name);
      execute format('create policy "Admins update rows" on public.%I for update using (public.is_content_admin()) with check (public.is_content_admin())', table_name);
      execute format('drop policy if exists "Admins delete rows" on public.%I', table_name);
      execute format('create policy "Admins delete rows" on public.%I for delete using (public.is_content_admin())', table_name);
    end if;
  end loop;
end $$;

-- After the intended Supabase Auth user exists, register that user once:
-- insert into public.admin_users (user_id, email)
-- select id, email from auth.users where lower(email) = lower('hady19923@gmail.com')
-- on conflict (user_id) do update set email = excluded.email;
