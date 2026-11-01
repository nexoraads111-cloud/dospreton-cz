-- DOSPRETON reviews (otzivy / recenze)
-- Supabase → SQL Editor → Run this entire script once.
-- Public site shows only status = 'approved'.

create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  body text not null check (char_length(trim(body)) between 10 and 2000),
  -- Optional rating: 1–5, or null when visitor skips
  rating smallint check (rating is null or rating between 1 and 5),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_action text check (decided_action is null or decided_action in ('approve', 'reject'))
);

-- Idempotent upgrades if an older NOT NULL rating column exists
do $$
begin
  alter table public.reviews alter column rating drop not null;
exception
  when undefined_table then null;
  when undefined_column then null;
  when others then null;
end $$;

do $$
declare r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'reviews'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%rating%'
  loop
    execute format('alter table public.reviews drop constraint %I', r.conname);
  end loop;
  alter table public.reviews
    add constraint reviews_rating_range_chk
    check (rating is null or rating between 1 and 5);
exception
  when undefined_table then null;
  when duplicate_object then null;
end $$;

create index if not exists reviews_approved_created_at_idx
  on public.reviews (created_at desc)
  where status = 'approved';

create index if not exists reviews_status_idx on public.reviews (status);

-- Force every client insert to pending (never allow self-approve)
create or replace function public.reviews_force_pending()
returns trigger
language plpgsql
as $$
begin
  new.status := 'pending';
  new.decided_at := null;
  new.decided_action := null;
  return new;
end;
$$;

drop trigger if exists reviews_force_pending_trg on public.reviews;
create trigger reviews_force_pending_trg
  before insert on public.reviews
  for each row
  execute function public.reviews_force_pending();

alter table public.reviews enable row level security;

do $$
declare r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'reviews'
  loop
    execute format('drop policy if exists %I on public.reviews', r.policyname);
  end loop;
end $$;

-- Anyone can read APPROVED reviews only
create policy "reviews_select_approved"
  on public.reviews
  for select
  to anon, authenticated
  using (status = 'approved');

-- Anyone can insert a new review (trigger forces status=pending)
create policy "reviews_insert_pending"
  on public.reviews
  for insert
  to anon, authenticated
  with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert on table public.reviews to anon, authenticated;
-- Updates (approve/reject) only via service_role / Edge Function
