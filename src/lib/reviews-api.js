import { db, isSupabaseConfigured } from './supabase'

function readConfig() {
  const fromEnv = {
    url: (import.meta.env.VITE_SUPABASE_URL || '').trim(),
    anonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim(),
  }
  if (fromEnv.url && fromEnv.anonKey) return fromEnv
  if (typeof window !== 'undefined' && window.DOSPRETON_SUPABASE) {
    const cfg = window.DOSPRETON_SUPABASE
    return {
      url: String(cfg.url || '').trim(),
      anonKey: String(cfg.anonKey || '').trim(),
    }
  }
  return fromEnv
}

/**
 * Public approved reviews for the Recenze section.
 */
export async function fetchApprovedReviews() {
  if (!isSupabaseConfigured || !db) return []
  const { data, error } = await db
    .from('reviews')
    .select('id, author_name, body, rating, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(40)
  if (error) {
    console.error('Reviews fetch error:', error)
    throw error
  }
  return (data || []).map((r) => ({
    id: r.id,
    authorName: r.author_name,
    body: r.body,
    rating: r.rating,
    createdAt: r.created_at,
  }))
}

async function submitViaEdgeFunction({ authorName, body, rating, url, anonKey }) {
  const res = await fetch(`${url}/functions/v1/submit-review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      author_name: authorName,
      body,
      rating,
    }),
  })

  let payload = null
  try {
    payload = await res.json()
  } catch {
    payload = null
  }

  if (res.status === 404) {
    const err = new Error('edge_missing')
    err.code = 'edge_missing'
    throw err
  }

  if (!res.ok) {
    throw new Error(payload?.error || `Odeslání selhalo (${res.status}).`)
  }
  return { ...payload, via: 'edge' }
}

async function submitViaTable({ authorName, body, rating }) {
  if (!db) throw new Error('Supabase není nakonfigurován.')
  const { data, error } = await db
    .from('reviews')
    .insert({
      author_name: authorName,
      body,
      rating,
      status: 'pending',
    })
    .select('id')
    .single()
  if (error) throw new Error(error.message || 'Uložení recenze se nezdařilo.')
  return {
    ok: true,
    id: data?.id,
    via: 'table',
    emailSent: false,
    message:
      'Děkujeme. Recenze byla uložena a po schválení se zobrazí na webu.',
  }
}

/**
 * Prefer Edge Function (email Accept/Cancel). Fall back to direct pending insert.
 */
export async function submitReview({ authorName, body, rating }) {
  const { url, anonKey } = readConfig()
  if (!url || !anonKey) {
    throw new Error('Supabase není nakonfigurován.')
  }

  try {
    return await submitViaEdgeFunction({ authorName, body, rating, url, anonKey })
  } catch (err) {
    if (err?.code === 'edge_missing' || /Failed to fetch|NetworkError|404/i.test(err?.message || '')) {
      return submitViaTable({ authorName, body, rating })
    }
    throw err
  }
}
