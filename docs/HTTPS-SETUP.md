# HTTPS for dospreton-stav.cz (GitHub Pages)

## What’s wrong (diagnosed 2026-11-01)

Browsers show **“Not secure / Connection is not confidential”** because HTTPS presents GitHub’s default cert:

- Certificate CN: `*.github.io` (not `dospreton-stav.cz`)
- GitHub Pages API: `https_certificate.state = dns_changed`  
  (“Detected a change to DNS settings. Requesting a new certificate.”)
- `https_enforced: false` — Enforce HTTPS is off until a valid custom cert exists

HTTP (`http://dospreton-stav.cz/`) works. Site JS/CSS load; no mixed-content console errors found on a headless scan.

## DNS (Forpsi) — already correct

No DNS change required unless the cert stays stuck after a re-request:

| Host | Type | Value |
|------|------|--------|
| `@` (apex) | **A** | `185.199.108.153` |
| `@` | **A** | `185.199.109.153` |
| `@` | **A** | `185.199.110.153` |
| `@` | **A** | `185.199.111.153` |
| `www` | **CNAME** | `nexoraads111-cloud.github.io.` |

Verified via Google (8.8.8.8) and Cloudflare (1.1.1.1).  
NS: `ns.forpsi.cz` / `ns.forpsi.net` / `ns.forpsi.it`.  
No CAA records blocking Let’s Encrypt. Repo `CNAME` file = `dospreton-stav.cz`.

Do **not** put a CNAME on the apex. Do **not** point A records elsewhere.

## What the site owner must do in GitHub (outside this repo)

Agent tokens cannot update Pages settings (`403 Resource not accessible by integration`). Owner/admin:

1. Open **https://github.com/nexoraads111-cloud/dospreton-cz/settings/pages**
2. Under **Custom domain**, confirm `dospreton-stav.cz` (and that DNS check is green).
3. Wait until **TLS/SSL certificate** shows something like *Certificate is ready* / issued (not “DNS changed” forever — often 5–60 minutes, sometimes longer).
4. Then enable **Enforce HTTPS**.
5. If stuck on “DNS changed” for many hours:
   - Remove the custom domain → Save  
   - Wait ~5 minutes  
   - Add `dospreton-stav.cz` again → Save  
   - Wait for DNS check + new certificate  
   - Enable **Enforce HTTPS**

Optional: ensure `www.dospreton-stav.cz` is listed / redirects (Pages usually handles www when apex is set and DNS CNAME exists).

## After HTTPS works

- Visit `https://dospreton-stav.cz/` — padlock should be OK  
- `http://` should redirect to `https://` once Enforce HTTPS is on  
- Hard-refresh if CDN cached the old warning
