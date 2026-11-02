/**
 * GET /functions/v1/review-action?id=&action=approve|reject&exp=&sig=
 * Verifies HMAC, updates review status, then 302-redirects to a static Czech
 * result page on the marketing site (Supabase gateway forces text/plain on
 * function bodies, so we cannot rely on inline HTML rendering in the browser).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import { corsHeaders } from '../_shared/cors.ts'
import { verifyAction } from '../_shared/tokens.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return redirectResult('chyba', 303)
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
      return redirectResult('chyba', 303, siteUrl)
    }

    const ok = await verifyAction(reviewSecret, id, action, exp, sig)
    if (!ok) {
      return redirectResult('neplatny', 303, siteUrl)
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
      return redirectResult('nenalezena', 303, siteUrl)
    }

    // Reject always hides (even if previously approved). Approve only from pending/rejected.
    if (action === 'reject') {
      if (existing.status === 'rejected') {
        return redirectResult('odmitnuta', 303, siteUrl)
      }
      const { error: updateError } = await admin
        .from('reviews')
        .update({
          status: 'rejected',
          decided_at: new Date().toISOString(),
          decided_action: 'reject',
        })
        .eq('id', id)

      if (updateError) {
        console.error(updateError)
        return redirectResult('chyba', 303, siteUrl)
      }
      return redirectResult('odmitnuta', 303, siteUrl)
    }

    // approve
    if (existing.status === 'approved') {
      return redirectResult('schvalena', 303, siteUrl)
    }

    const { error: updateError } = await admin
      .from('reviews')
      .update({
        status: 'approved',
        decided_at: new Date().toISOString(),
        decided_action: 'approve',
      })
      .eq('id', id)

    if (updateError) {
      console.error(updateError)
      return redirectResult('chyba', 303, siteUrl)
    }
    return redirectResult('schvalena', 303, siteUrl)
  } catch (err) {
    console.error(err)
    return redirectResult('chyba', 303)
  }
})

function redirectResult(
  stav: 'schvalena' | 'odmitnuta' | 'neplatny' | 'nenalezena' | 'chyba',
  status = 303,
  siteUrl = (Deno.env.get('SITE_URL') || 'http://dospreton-stav.cz').replace(/\/$/, ''),
) {
  const location = `${siteUrl}/recenze-stav.html?stav=${encodeURIComponent(stav)}`
  return new Response(null, {
    status,
    headers: {
      ...corsHeaders,
      Location: location,
      'Cache-Control': 'no-store',
    },
  })
}
