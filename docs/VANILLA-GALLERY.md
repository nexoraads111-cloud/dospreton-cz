# Vanilla Supabase gallery + admin (GitHub Pages)

Plain HTML/CSS/JS — no Node at runtime. Works next to the existing marketing SPA.

## Files

| Path | Role |
|------|------|
| `admin.html` | Admin UI (login, upload, list, delete, logout) |
| `css/admin.css` | Admin styles (black / gold, mobile-first) |
| `css/public-gallery.css` | Public “Nahrané realizace” section |
| `js/supabase-config.example.js` | Template for URL + publishable key |
| `js/supabase-config.js` | **Your** config (gitignored — create locally) |
| `js/supabase-client.js` | Shared client helpers |
| `js/admin.js` | Admin page logic |
| `js/public-gallery.js` | Public gallery + lightbox |
| `supabase/setup.sql` | Table, bucket, RLS, storage policies |
| `index.html` | Existing SPA shell + script tags for public gallery |

## 1. Paste URL + publishable key (local)

```bash
cp js/supabase-config.example.js js/supabase-config.js
```

Edit `js/supabase-config.js`:

```js
window.DOSPRETON_SUPABASE = {
  url: 'https://vxitorpldzfwtexzswde.supabase.co',
  anonKey: 'YOUR_PUBLISHABLE_KEY',
}
```

Use the **anon / publishable** key only. Never put `service_role` in these files or the repo.

## 2. Supabase dashboard — step by step

### A. Apply SQL
1. Open [Supabase Dashboard](https://supabase.com/dashboard) → project `vxitorpldzfwtexzswde`
2. **SQL Editor** → New query  
3. Paste contents of `supabase/setup.sql` → **Run**  
   Creates/updates: `gallery_images`, public bucket `gallery` (5 MB, jpeg/png/webp), RLS + storage policies.

**If upload fails with** `gallery_images` **RLS / 42501:** run `supabase/fix-gallery-images-rls.sql` (drops all table policies, grants SELECT to public + INSERT/DELETE to authenticated).

**Category for Realizace filters:** run `supabase/add-gallery-category.sql`, then choose **Kategorie** in `admin.html` on upload (`obklady` / `koupelny` / `kamen` / `schody`). Uploads appear in **Naše práce v praxi** (unified grid), not a separate «Nahrané» block.

### B. Create admin user (no public signup)
1. **Authentication** → **Users** → **Add user**  
2. Email + password (this is the admin login for `admin.html`)  
3. Leave public signup disabled (default) unless you intentionally want it.

### C. Confirm Storage
1. **Storage** → bucket **`gallery`** exists and is **public**  
2. File size limit 5 MB (set by SQL)

### D. Confirm table
1. **Table Editor** → `gallery_images`  
   Columns: `id`, `storage_path`, `alt_text`, `created_at`

## 3. Local smoke test (no deploy)

```bash
npx --yes serve -l 4177 .
# open http://127.0.0.1:4177/admin.html
# open http://127.0.0.1:4177/  → scroll to “Nahrané realizace”
```

1. Sign in on `admin.html`  
2. Upload 1–2 JPEG/PNG/WebP ≤5 MB  
3. Refresh the marketing page — new photos appear under **Nahrané realizace**  
4. Delete from admin → refresh public page  

## 4. GitHub Pages (when user allows publish)

Do **not** push until explicitly allowed. When allowed:

1. Ensure `js/supabase-config.js` exists on the machine that builds/uploads **or** commit only the example and create config on the host (config must be present on Pages for the gallery to work).  
   - Typical approach: keep config **out of git**; for Pages, either generate it in CI from secrets, or add it once on a private deploy step.  
2. Push static files (`admin.html`, `css/`, `js/*.js` except secrets, `supabase/setup.sql`, updated `index.html`).  
3. Visit `https://YOUR_PAGES_DOMAIN/admin.html`

**Important:** Publishable keys are meant for the browser, but still do not commit `js/supabase-config.js` with the real key if the repo is public — prefer CI writing that file from GitHub Actions secrets at deploy time.

## 5. Security summary

| Action | Who |
|--------|-----|
| Read `gallery_images` + public URLs | Anyone (anon) |
| Upload / delete storage objects | `authenticated` only (own folder) |
| Insert / delete DB rows | `authenticated` only |
| `service_role` | Never in client |

Client also validates MIME + 5 MB; Storage bucket enforces the same limits server-side.

## Upload fails with Storage/RLS

1. Open Supabase → **SQL Editor**
2. Run the entire file `supabase/fix-upload.sql` (or re-run `supabase/setup.sql`)
3. Confirm Storage → **gallery** bucket is **Public**
4. Sign out/in on `admin.html` and retry upload  
The admin UI now shows the raw Supabase error text if it still fails.
