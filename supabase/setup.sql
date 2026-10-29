-- DOSPRETON gallery — run in Supabase → SQL Editor (as project owner)
-- Re-run this whole script if admin upload fails with Storage/RLS errors.

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
-- Note: do NOT over-restrict MIME on the bucket — phones sometimes send
-- odd/empty types; app still validates JPEG/PNG/WebP client-side.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  5242880, -- 5 MB
  null     -- allow; client validates type
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = null;

-- ---------------------------------------------------------------------------
-- 3) Storage policies (drop ALL known variants, recreate cleanly)
-- ---------------------------------------------------------------------------
drop policy if exists "Public read gallery" on storage.objects;
drop policy if exists "Auth upload gallery" on storage.objects;
drop policy if exists "Auth delete own gallery" on storage.objects;
drop policy if exists "Auth upload gallery loose" on storage.objects;
drop policy if exists "Auth delete gallery" on storage.objects;

-- Anyone can read objects in public gallery bucket
create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

-- Authenticated users may upload into gallery bucket
-- (path convention userId/uuid.ext is enforced in the app)
create policy "Auth upload gallery"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

-- Authenticated users may delete from gallery bucket
create policy "Auth delete gallery"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery');
