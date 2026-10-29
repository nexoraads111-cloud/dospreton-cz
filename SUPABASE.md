# Supabase setup — DOSPRETON gallery

The public **Realizace** section merges local client photos with rows from Supabase.
Admin upload lives at **`#admin`** (e.g. `http://dospreton-stav.cz/#admin`).

## 1. Environment variables

Create `.env.local` in the project root (never commit it — gitignored):

```bash
cp .env.example .env.local
```

Set:

| Variable | Value |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL from Supabase → Settings → API (`https://….supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `anon` **or** publishable key (`sb_publishable_…`) from the same page |

Both are required. Rebuild and redeploy after changing env (Vite bakes these in at build time):

```bash
npm run build
# review `git status` — do not stage `.env.local`
git add -A && git commit -m "Build site with Supabase config" && git push origin main
```

For GitHub Actions/Pages, store the same values as repository secrets and write them into `.env.local` (or export) before `npm run build`. Never put secrets in the repo or PR text.

Without URL + key the site still works using local photos only; admin shows a setup notice.

## 2. Storage bucket `gallery`

Supabase → Storage → New bucket:

- Name: **`gallery`**
- **Public** bucket: ON (needed for `getPublicUrl` on the marketing site)

Suggested policies (SQL editor):

```sql
-- Public read
create policy "Public read gallery"
on storage.objects for select
using (bucket_id = 'gallery');

-- Authenticated upload into own folder
create policy "Auth upload gallery"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated delete own files (rollback on failed DB insert)
create policy "Auth delete own gallery"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'gallery'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## 3. Table `gallery_images`

```sql
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text,
  created_at timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

-- Anyone can read (public site)
create policy "Public read gallery_images"
on public.gallery_images for select
using (true);

-- Only signed-in users can insert
create policy "Auth insert gallery_images"
on public.gallery_images for insert
to authenticated
with check (true);
```

## 4. Auth user for admin

Authentication → Users → Add user (email + password).  
Use that account on `#admin` to upload.

## 5. Upload rules (enforced in app)

- Max **10** files per submit  
- **JPEG / PNG / WebP** only  
- Max **5 MB** each  
- Storage path: `{user.id}/{uuid}.{ext}`  
- On DB insert failure the uploaded file is **removed** (rollback)

## 6. Smoke test

1. Open `/#admin`, sign in, upload 1–2 photos.  
2. Open `/#` → Realizace → filter **Nahrané** (or **Vše**) → lightbox.
