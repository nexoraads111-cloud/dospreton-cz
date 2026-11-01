/**
 * GET /functions/v1/review-action?id=&action=approve|reject&exp=&sig=
 * Verifies HMAC token and updates review status. Returns a simple HTML page.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAction } from '../_shared/tokens.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'GET') {
    return htmlPage('Metoda není povolena', 'Použijte odkaz z e-mailu.', 405)
  }

  try {
    const url = new URL(req.url)
    const id = (url.searchParams.get('id') || '').trim()
    const action = (url.searchParams.get('action') || '').trim()
    const exp = Number(url.searchParams.get('exp') || 0)
    const sig = (url.searchParams.get('sig') || '').trim().toLowerCase()

    const reviewSecret = Deno.env.get('REVIEW_ACTION_SECRET') || ''
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const siteUrl = (Deno.env.get('SITE_URL') || 'http://dospreton-stav.cz').replace(/\/$/, '')

    if (!reviewSecret || !supabaseUrl || !serviceKey) {
      return htmlPage('Chyba konfigurace', 'Server není správně nastaven.', 500)
    }

    const ok = await verifyAction(reviewSecret, id, action, exp, sig)
    if (!ok) {
      return htmlPage(
        'Neplatný nebo prošlý odkaz',
        'Odkaz pro schválení/zrušení není platný. Požádejte o novou recenzi nebo zkontrolujte e-mail.',
        403,
      )
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: existing, error: fetchError } = await admin
      .from('reviews')
      .select('id, status, author_name')
      .eq('id', id)
      .maybeSingle()

    if (fetchError || !existing) {
      return htmlPage('Recenze nenalezena', 'Tato recenze už neexistuje.', 404)
    }

    if (existing.status !== 'pending') {
      const label =
        existing.status === 'approved' ? 'už byla přijata' : 'už byla zrušena'
      return htmlPage(
        'Hotovo dříve',
        `Recenze od „${existing.author_name}“ ${label}.`,
        200,
        siteUrl,
      )
    }

    const status = action === 'approve' ? 'approved' : 'rejected'
    const { error: updateError } = await admin
      .from('reviews')
      .update({
        status,
        decided_at: new Date().toISOString(),
        decided_action: action,
      })
      .eq('id', id)
      .eq('status', 'pending')

    if (updateError) {
      console.error(updateError)
      return htmlPage('Chyba', 'Stav recenze se nepodařilo změnit.', 500)
    }

    if (action === 'approve') {
      return htmlPage(
        'Recenze přijata',
        `Recenze od „${existing.author_name}“ je nyní veřejná na webu.`,
        200,
        siteUrl,
      )
    }
    return htmlPage(
      'Recenze zrušena',
      `Recenze od „${existing.author_name}“ byla skryta a na webu se nezobrazí.`,
      200,
      siteUrl,
    )
  } catch (err) {
    console.error(err)
    return htmlPage('Chyba', 'Neočekávaná chyba serveru.', 500)
  }
})

function htmlPage(title: string, message: string, status = 200, siteUrl?: string) {
  const link = siteUrl
    ? `<p style="margin-top:24px"><a href="${siteUrl}/#recenze" style="color:#e0b43a">Zpět na web → Recenze</a></p>`
    : ''
  const body = `<!doctype html>
<html lang="cs">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} · DOSPRETON</title>
  <style>
    body{margin:0;font-family:system-ui,sans-serif;background:#050505;color:#f5f5f5;min-height:100vh;display:grid;place-items:center;padding:1.5rem}
    .card{max-width:420px;background:#161616;border:1px solid rgba(224,180,58,.35);padding:1.75rem}
    h1{margin:0 0 .75rem;font-size:1.4rem;color:#e0b43a}
    p{margin:0;line-height:1.5;color:#ccc}
    a{color:#e0b43a}
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    <p>${escapeHtml(message)}</p>
    ${link}
  </div>
</body>
</html>`
  return new Response(body, {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
}

function escapeHtml(s: string): string {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}
