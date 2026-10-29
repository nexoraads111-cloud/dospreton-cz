-- Optional category for Realizace filters (Obklady / Koupelny / …)
-- Supabase → SQL Editor → Run, then use Kategorie in admin.html on upload.

alter table public.gallery_images
  add column if not exists category text not null default 'obklady';

comment on column public.gallery_images.category is
  'Realizace filter id: obklady | koupelny | kamen | schody';

-- Normalize any unexpected values
update public.gallery_images
set category = 'obklady'
where category is null
   or category not in ('obklady', 'koupelny', 'kamen', 'schody');
