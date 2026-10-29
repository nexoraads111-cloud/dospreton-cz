# DOSPRETON s.r.o. — marketingový web

Jednostránkový marketingový web stavební firmy **DOSPRETON s.r.o.** (Vite + React).

**Live:** [http://dospreton-stav.cz/](http://dospreton-stav.cz/)  
(GitHub Pages; `https://nexoraads111-cloud.github.io/dospreton-cz/` redirects here)

## Lokální spuštění

```bash
npm install
cp .env.example .env.local   # doplňte Supabase URL + anon/publishable key
npm run dev
```

Otevřete URL z terminálu (obvykle `http://localhost:5173`).  
Admin galerie: přidejte `#admin` (např. `http://localhost:5173/#admin`).

## Supabase (online galerie)

| Proměnná | Popis |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL (`https://xxxx.supabase.co`) — **povinné** |
| `VITE_SUPABASE_ANON_KEY` | Anon / publishable key — **povinné** |

Bez těchto proměnných web běží s lokálními fotografiemi; admin zobrazí návod.

Podrobné SQL / bucket / RLS: viz [`SUPABASE.md`](./SUPABASE.md).

**GitHub Pages:** klíče se vkládají při `npm run build` (Vite). Dejte je do `.env.local` před buildem, nebo do CI secrets a exportujte před `npm run build`. **Nikdy necommitujte** `.env` / `.env.local`.

## Produkční build / Pages sync

```bash
npm run build
```

Build output is synced to repo root + `docs/` for GitHub Pages (`main` `/`).

## Obsah

- Header / navigace + CTA
- Hero, Služby, O nás
- Realizace — filtr + lightbox (lokální + Supabase `gallery_images`)
- Kontakt / patička
- Admin galerie (`#admin`) — upload max 10× JPEG/PNG/WebP ≤5 MB
