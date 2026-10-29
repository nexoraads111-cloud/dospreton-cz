import { db, isSupabaseConfigured, publicGalleryUrl, GALLERY_BUCKET } from './supabase'

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
 * Load rows from gallery_images and map to public URLs.
 * @returns {Promise<Array<{ id: string, title: string, image: string, category: string, source: string, storagePath?: string }>>}
 */
export async function fetchRemoteGallery() {
  if (!isSupabaseConfigured || !db) return []

  const { data, error } = await db
    .from('gallery_images')
    .select('id, storage_path, alt_text, created_at')
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
        category: 'nahrane',
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
export async function uploadGalleryFiles(files, user, altText = '') {
  if (!db) throw new Error('Supabase není nakonfigurován.')
  if (!user?.id) throw new Error('Nejste přihlášeni.')

  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type]
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await db.storage.from(GALLERY_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { error: rowError } = await db.from('gallery_images').insert({
      storage_path: path,
      alt_text: altText.trim() || file.name,
    })

    if (rowError) {
      await db.storage.from(GALLERY_BUCKET).remove([path])
      throw rowError
    }
  }
}
