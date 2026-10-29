import { db, isSupabaseConfigured, publicGalleryUrl, GALLERY_BUCKET } from './supabase'
import { resolveGalleryCategory } from './gallery-category'

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export const UPLOAD_LIMITS = {
  maxFiles: 10,
  maxBytes: 5 * 1024 * 1024,
  types: ALLOWED_TYPES,
}

/**
 * Load rows from gallery_images and map to public URLs + Realizace categories.
 * @returns {Promise<Array<{ id: string, title: string, image: string, category: string, source: string, storagePath?: string }>>}
 */
export async function fetchRemoteGallery() {
  if (!isSupabaseConfigured || !db) return []

  // Select * so missing optional columns (e.g. category) do not 400 the whole gallery
  const { data, error } = await db
    .from('gallery_images')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Gallery error:', error)
    throw error
  }

  return (data || [])
    .map((photo) => {
      const image = publicGalleryUrl(photo.storage_path)
      if (!image) return null
      return {
        id: `remote-${photo.id || photo.storage_path}`,
        title: photo.alt_text || 'Fotografie realizace',
        image,
        category: resolveGalleryCategory(photo),
        source: 'supabase',
        storagePath: photo.storage_path,
      }
    })
    .filter(Boolean)
}

export function validateUploadFiles(fileList) {
  const files = Array.from(fileList || [])
  if (files.length === 0) return { ok: false, error: 'Vyberte alespoň jednu fotografii.' }
  if (files.length > UPLOAD_LIMITS.maxFiles) {
    return { ok: false, error: `Najednou lze nahrát maximálně ${UPLOAD_LIMITS.maxFiles} fotografií.` }
  }
  for (const file of files) {
    if (!ALLOWED_TYPES[file.type]) {
      return { ok: false, error: `Nepodporovaný formát: ${file.name}. Povolené: JPEG, PNG, WebP.` }
    }
    if (file.size > UPLOAD_LIMITS.maxBytes) {
      return { ok: false, error: `${file.name} je větší než 5 MB.` }
    }
  }
  return { ok: true, files }
}

/**
 * Upload files to storage + insert gallery_images rows.
 * Rolls back storage object if DB insert fails.
 */
export async function uploadGalleryFiles(files, user, altText = '', category = 'obklady') {
  if (!db) throw new Error('Supabase není nakonfigurován.')
  if (!user?.id) throw new Error('Nejste přihlášeni.')

  const cat = resolveGalleryCategory({ category })

  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type]
    const path = `${user.id}/${uuidv4()}.${ext}`

    const { error: uploadError } = await db.storage.from(GALLERY_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const row = {
      storage_path: path,
      alt_text: altText.trim() || file.name,
      category: cat,
    }

    let { error: rowError } = await db.from('gallery_images').insert(row)
    if (rowError && /category/i.test(rowError.message || '')) {
      delete row.category
      ;({ error: rowError } = await db.from('gallery_images').insert(row))
    }

    if (rowError) {
      await db.storage.from(GALLERY_BUCKET).remove([path])
      throw rowError
    }
  }
}

/** UUID v4 — safe on HTTP (Pages custom domain without HTTPS). */
function uuidv4() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch (_) {
      /* fall through */
    }
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
