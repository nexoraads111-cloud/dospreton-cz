import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim() || ''
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || ''

export const isSupabaseConfigured = Boolean(url && anonKey)

/** @type {import('@supabase/supabase-js').SupabaseClient | null} */
export const db = isSupabaseConfigured ? createClient(url, anonKey) : null

export const GALLERY_BUCKET = 'gallery'

export function publicGalleryUrl(storagePath) {
  if (!db || !storagePath) return ''
  const { data } = db.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return data?.publicUrl || ''
}
