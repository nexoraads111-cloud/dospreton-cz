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
 * @returns {Promise<Array<{ id: string, authorName: string, body: string, rating: number, createdAt: string }>>}
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

/**
 * Submit a review via Edge Function (pending + admin email).
 */
export async function submitReview({ authorName, body, rating }) {
  const { url, anonKey } = readConfig()
  if (!url || !anonKey) {
    throw new Error('Supabase není nakonfigurován.')
  }

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

  if (!res.ok) {
    const msg = payload?.error || `Odeslání selhalo (${res.status}).`
    throw new Error(msg)
  }
  return payload
}
