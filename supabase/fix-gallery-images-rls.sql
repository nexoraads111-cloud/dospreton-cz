-- FIX: DB gallery_images · new row violates row-level security policy (42501)
-- Supabase Dashboard → SQL Editor → paste & Run this ENTIRE script, then retry admin upload.
--
-- App inserts only: { storage_path, alt_text } as an authenticated user (publishable key + session).
-- No user_id column. No service_role in the client.

-- ---------------------------------------------------------------------------
-- 1) Table shape (idempotent) — match js/supabase-client.js insert payload
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text,
  category text not null default 'obklady',
  created_at timestamptz not null default now()
);

alter table public.gallery_images
  add column if not exists category text not null default 'obklady';

-- If an older schema added user_id with a strict policy, keep the column nullable
-- so inserts that omit it still succeed. Do not require auth.uid() = user_id.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'gallery_images'
      and column_name = 'user_id'
  ) then
    alter table public.gallery_images alter column user_id drop not null;
  end if;
exception
  when undefined_column then null;
  when others then null;
end $$;

create index if not exists gallery_images_created_at_idx
  on public.gallery_images (created_at desc);

-- ---------------------------------------------------------------------------
-- 2) Privileges (RLS alone is not enough without GRANTs)
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;

grant select on table public.gallery_images to anon, authenticated;
grant insert, delete on table public.gallery_images to authenticated;

-- ---------------------------------------------------------------------------
-- 3) Drop EVERY existing RLS policy on gallery_images, then recreate cleanly
-- ---------------------------------------------------------------------------
alter table public.gallery_images enable row level security;

do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'gallery_images'
  loop
    execute format('drop policy if exists %I on public.gallery_images', r.policyname);
  end loop;
end $$;

-- Public gallery: anyone can read rows
create policy "gallery_images_select_public"
  on public.gallery_images
  for select
  to anon, authenticated
  using (true);

-- Admin upload: any signed-in user may insert
create policy "gallery_images_insert_authenticated"
  on public.gallery_images
  for insert
  to authenticated
  with check (true);

-- Admin delete: any signed-in user may delete
create policy "gallery_images_delete_authenticated"
  on public.gallery_images
  for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 4) Sanity check (optional — shows policies after run)
-- ---------------------------------------------------------------------------
-- select policyname, cmd, roles, qual, with_check
-- from pg_policies
-- where schemaname = 'public' and tablename = 'gallery_images';
