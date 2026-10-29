/**
 * Shared Supabase browser client (CDN UMD global: supabase).
 * Requires js/supabase-config.js to set window.DOSPRETON_SUPABASE first.
 */
(function (global) {
  const cfg = global.DOSPRETON_SUPABASE || {}
  const url = (cfg.url || '').trim()
  const anonKey = (cfg.anonKey || '').trim()

  const configured = Boolean(url && anonKey && global.supabase?.createClient)

  /** @type {import('@supabase/supabase-js').SupabaseClient | null} */
  const db = configured ? global.supabase.createClient(url, anonKey) : null

  const GALLERY_BUCKET = 'gallery'

  const ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  const MAX_BYTES = 5 * 1024 * 1024

  function publicUrl(storagePath) {
    if (!db || !storagePath) return ''
    const { data } = db.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
    return data?.publicUrl || ''
  }

  async function fetchGalleryImages() {
    if (!db) throw new Error('Supabase není nakonfigurován (chybí URL/klíč nebo CDN).')
    const { data, error } = await db
      .from('gallery_images')
      .select('id, storage_path, alt_text, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || []).map((row) => ({
      id: row.id,
      storagePath: row.storage_path,
      alt: row.alt_text || 'Fotografie realizace',
      createdAt: row.created_at,
      url: publicUrl(row.storage_path),
    }))
  }

  function validateFiles(fileList) {
    const files = Array.from(fileList || [])
    if (!files.length) return { ok: false, error: 'Vyberte alespoň jednu fotografii.' }
    for (const file of files) {
      if (!ALLOWED_TYPES[file.type]) {
        return {
          ok: false,
          error: `Nepodporovaný formát: ${file.name}. Povolené: JPEG, PNG, WebP.`,
        }
      }
      if (file.size > MAX_BYTES) {
        return { ok: false, error: `${file.name} je větší než 5 MB.` }
      }
    }
    return { ok: true, files }
  }

  /**
   * Upload one file + insert DB row. Rolls back storage object if insert fails.
   */
  async function uploadOne(file, userId, altText) {
    const ext = ALLOWED_TYPES[file.type]
    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await db.storage.from(GALLERY_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (uploadError) throw uploadError

    const { error: rowError } = await db.from('gallery_images').insert({
      storage_path: path,
      alt_text: (altText || '').trim() || file.name,
    })
    if (rowError) {
      await db.storage.from(GALLERY_BUCKET).remove([path])
      throw rowError
    }
    return path
  }

  async function deleteImage(row) {
    if (!db) throw new Error('Supabase není nakonfigurován.')
    const path = row.storagePath || row.storage_path
    const id = row.id
    if (id) {
      const { error: delRow } = await db.from('gallery_images').delete().eq('id', id)
      if (delRow) throw delRow
    }
    if (path) {
      const { error: delFile } = await db.storage.from(GALLERY_BUCKET).remove([path])
      if (delFile) throw delFile
    }
  }

  global.DospretonGallery = {
    db,
    configured,
    GALLERY_BUCKET,
    ALLOWED_TYPES,
    MAX_BYTES,
    publicUrl,
    fetchGalleryImages,
    validateFiles,
    uploadOne,
    deleteImage,
  }
})(window)
