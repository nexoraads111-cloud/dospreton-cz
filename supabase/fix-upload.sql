-- FIX: Admin upload «Chyba nahrávání / Storage/RLS»
-- Supabase Dashboard → SQL Editor → Run this entire script, then retry upload.

-- Ensure bucket is public and not blocking MIME
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', true, 5242880, null)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = null;

-- Reset storage policies for gallery
drop policy if exists "Public read gallery" on storage.objects;
drop policy if exists "Auth upload gallery" on storage.objects;
drop policy if exists "Auth delete own gallery" on storage.objects;
drop policy if exists "Auth upload gallery loose" on storage.objects;
drop policy if exists "Auth delete gallery" on storage.objects;

create policy "Public read gallery"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Auth upload gallery"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery');

create policy "Auth delete gallery"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'gallery');

-- Ensure table RLS allows authenticated insert/delete + public read
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
