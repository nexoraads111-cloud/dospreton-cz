import { createClient } from '@supabase/supabase-js'

/**
 * Prefer Vite env (build-time). Fall back to window.DOSPRETON_SUPABASE
 * from js/supabase-config.js so Pages still works if CI env was missing.
 */
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

const { url, anonKey } = readConfig()

export const isSupabaseConfigured = Boolean(url && anonKey)

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const db = isSupabaseConfigured ? createClient(url, anonKey) : null

export const GALLERY_BUCKET = 'gallery'

export function publicGalleryUrl(storagePath) {
  if (!db || !storagePath) return ''
  const { data } = db.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return data?.publicUrl || ''
}
