/**
 * POST /functions/v1/submit-review
 * Body: { author_name, body, rating? }
 * Inserts pending review + emails admin Accept/Reject links (Resend).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'
import { signAction } from '../_shared/tokens.ts'

const TOKEN_TTL_SEC = 60 * 60 * 24 * 14 // 14 days

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const reviewSecret = Deno.env.get('REVIEW_ACTION_SECRET') || ''
    const resendKey = Deno.env.get('RESEND_API_KEY') || ''
    const notifyEmail =
      (Deno.env.get('REVIEW_NOTIFY_EMAIL') || 'dospreton.stav.cz@gmail.com').trim()
    const siteUrl = (Deno.env.get('SITE_URL') || 'http://dospreton-stav.cz').replace(/\/$/, '')
    const fromEmail =
      (Deno.env.get('REVIEW_FROM_EMAIL') || 'DOSPRETON <onboarding@resend.dev>').trim()

    if (!supabaseUrl || !serviceKey) {
      return json({ error: 'Server misconfigured (Supabase)' }, 500)
    }
    if (!reviewSecret || reviewSecret.length < 16) {
      return json(
        {
          error:
            'Chybí REVIEW_ACTION_SECRET (min. 16 znaků) v secrets Edge Functions.',
        },
        503,
      )
    }

    // Optional: require a valid anon JWT / apikey from the browser
    const auth = req.headers.get('Authorization') || ''
    if (anonKey && !auth.includes(anonKey) && !req.headers.get('apikey')) {
      // still allow if apikey header present (supabase-js sets both)
    }

    const payload = await req.json().catch(() => null)
    const author_name = String(payload?.author_name || '').trim()
    const body = String(payload?.body || '').trim()
    const rating = Number(payload?.rating ?? 5)

    if (author_name.length < 2 || author_name.length > 80) {
      return json({ error: 'Jméno musí mít 2–80 znaků.' }, 400)
    }
    if (body.length < 10 || body.length > 2000) {
      return json({ error: 'Text recenze musí mít 10–2000 znaků.' }, 400)
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return json({ error: 'Hodnocení musí být 1–5.' }, 400)
    }

    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: row, error: insertError } = await admin
      .from('reviews')
      .insert({
        author_name,
        body,
        rating,
        status: 'pending',
      })
      .select('id, author_name, body, rating, created_at')
      .single()

    if (insertError || !row) {
      console.error(insertError)
      return json({ error: 'Uložení recenze se nezdařilo.' }, 500)
    }

    const exp = Math.floor(Date.now() / 1000) + TOKEN_TTL_SEC
    const approveSig = await signAction(reviewSecret, row.id, 'approve', exp)
    const rejectSig = await signAction(reviewSecret, row.id, 'reject', exp)
    const base = `${supabaseUrl}/functions/v1/review-action`
    const approveUrl =
      `${base}?id=${encodeURIComponent(row.id)}&action=approve&exp=${exp}&sig=${approveSig}`
    const rejectUrl =
      `${base}?id=${encodeURIComponent(row.id)}&action=reject&exp=${exp}&sig=${rejectSig}`

    let emailSent = false
    let emailSkippedReason: string | null = null

    if (!resendKey) {
      emailSkippedReason =
        'RESEND_API_KEY chybí — recenze je uložená jako pending, e-mail neodeslán.'
      console.warn(emailSkippedReason)
    } else {
      const stars = '★'.repeat(row.rating) + '☆'.repeat(5 - row.rating)
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
          <h2 style="margin:0 0 12px">Nová recenze — DOSPRETON</h2>
          <p style="margin:0 0 8px"><strong>Jméno:</strong> ${escapeHtml(row.author_name)}</p>
          <p style="margin:0 0 8px"><strong>Hodnocení:</strong> ${stars} (${row.rating}/5)</p>
          <p style="margin:0 0 16px;white-space:pre-wrap;background:#f6f6f4;padding:12px;border-left:3px solid #e0b43a">${escapeHtml(row.body)}</p>
          <p style="margin:0 0 20px;color:#666;font-size:13px">Web: ${escapeHtml(siteUrl)}</p>
          <p style="margin:0 0 12px">
            <a href="${approveUrl}" style="display:inline-block;background:#e0b43a;color:#111;text-decoration:none;padding:12px 18px;font-weight:700;margin-right:8px">Přijmout</a>
            <a href="${rejectUrl}" style="display:inline-block;background:#222;color:#fff;text-decoration:none;padding:12px 18px;font-weight:700">Zrušit</a>
          </p>
          <p style="font-size:12px;color:#888">Odkazy platí 14 dní a jsou podepsané (nelze je uhodnout).</p>
        </div>`

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [notifyEmail],
          subject: `Nová recenze od ${row.author_name} (${row.rating}/5)`,
          html,
        }),
      })
      if (!res.ok) {
        const detail = await res.text()
        console.error('Resend error', res.status, detail)
        emailSkippedReason = `E-mail se nepodařilo odeslat (${res.status}). Recenze zůstává pending.`
        // Common: onboarding@resend.dev can only send to the Resend account owner
        // until a custom domain is verified.
        if (/verify a domain|own email address/i.test(detail)) {
          emailSkippedReason +=
            ' Ověřte doménu v Resend a nastavte REVIEW_FROM_EMAIL (např. recenze@dospreton-stav.cz).'
        }
      } else {
        emailSent = true
      }
    }

    return json({
      ok: true,
      id: row.id,
      emailSent,
      emailSkippedReason,
      message: emailSent
        ? 'Děkujeme. Recenze čeká na schválení.'
        : 'Děkujeme. Recenze byla uložena a čeká na schválení.',
    })
  } catch (err) {
    console.error(err)
    return json({ error: 'Neočekávaná chyba serveru.' }, 500)
  }
})

function escapeHtml(s: string): string {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
