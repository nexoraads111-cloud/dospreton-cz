-- DOSPRETON gallery — run in Supabase → SQL Editor (as project owner)
-- Safe to re-run: uses IF NOT EXISTS / drop-policy-if-exists patterns where needed.

-- ---------------------------------------------------------------------------
-- 1) Table
-- ---------------------------------------------------------------------------
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_created_at_idx
  on public.gallery_images (created_at desc);

alter table public.gallery_images enable row level security;

drop policy if exists "Public read gallery_images" on public.gallery_images;
create policy "Public read gallery_images"
  on public.gallery_images for select
  using (true);

drop policy if exists "Auth insert gallery_images" on public.gallery_images;
create policy "Auth insert gallery_images"
  on public.gallery_images for insert
  to authenticated
  with check (true);

drop policy if exists "Auth delete gallery_images" on public.gallery_images;
create policy "Auth delete gallery_images"
  on public.gallery_images for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 2) Storage bucket (public read for marketing site)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- 3) Storage policies
-- ---------------------------------------------------------------------------
drop policy if exists "Public read gallery" on storage.objects;
create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

drop policy if exists "Auth upload gallery" on storage.objects;
create policy "Auth upload gallery"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Auth delete own gallery" on storage.objects;
create policy "Auth delete own gallery"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Optional: allow authenticated update (not required by current app)
-- drop policy if exists "Auth update own gallery" on storage.objects;
