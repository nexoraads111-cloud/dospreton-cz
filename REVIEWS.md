# Recenze (otzivy) — setup

Visitor submits a review → stored as `pending` → admin email to **dospreton.stav.cz@gmail.com** with **Přijmout** / **Zrušit** (HMAC-signed links) → approve shows on `#recenze`.

## 1. SQL

Supabase → SQL Editor → run `supabase/reviews.sql`.

## 2. Edge Functions

Deploy from repo (needs Supabase CLI + project login):

```bash
supabase functions deploy submit-review --project-ref vxitorpldzfwtexzswde
supabase functions deploy review-action --project-ref vxitorpldzfwtexzswde
```

## 3. Secrets (Supabase → Edge Functions → Secrets)

| Secret | Required | Notes |
|--------|----------|--------|
| `RESEND_API_KEY` | **Yes** for email | From [resend.com](https://resend.com) — **never commit to git** |
| `REVIEW_ACTION_SECRET` | **Yes** | Long random string (≥32 chars), e.g. `openssl rand -hex 32` |
| `REVIEW_NOTIFY_EMAIL` | Optional | Default / production: `dospreton.stav.cz@gmail.com` |
| `SITE_URL` | Optional | Default `http://dospreton-stav.cz` (use `https://…` after SSL) |
| `REVIEW_FROM_EMAIL` | Optional | Until domain verified: `DOSPRETON <onboarding@resend.dev>` (**only delivers to the Resend account owner**). After verifying a domain: e.g. `DOSPRETON <recenze@dospreton-stav.cz>` |

### Resend domain (required for production inbox)

With `from: onboarding@resend.dev`, Resend **only** allows sending to the account owner (`nexora.ads111@gmail.com`).  
To deliver approval emails to **`dospreton.stav.cz@gmail.com`**:

1. Open [resend.com/domains](https://resend.com/domains) → **Add domain** `dospreton-stav.cz` (or a subdomain).
2. Add the DNS records Resend shows (Forpsi).
3. Wait until domain is **Verified**.
4. Set Edge secret `REVIEW_FROM_EMAIL` to something like `DOSPRETON <recenze@dospreton-stav.cz>` (must use that domain).
5. Keep `REVIEW_NOTIFY_EMAIL=dospreton.stav.cz@gmail.com`.

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` are usually injected automatically for Edge Functions.

## 4. Admin use

1. Visitor fills **Recenze** form on the site.
2. You get email at `dospreton.stav.cz@gmail.com`.
3. **Přijmout** → status `approved` → visible publicly.
4. **Zrušit** → status `rejected` → hidden.

Links expire in 14 days and cannot be guessed (HMAC).

## Blocker

Without `RESEND_API_KEY`, submissions can still be saved as pending (function returns a skip reason), but **no approval email** is sent. Coordinator must provide a Resend API key to finish the email path.
