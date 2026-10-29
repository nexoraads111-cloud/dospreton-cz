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
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }

  const MAX_BYTES = 5 * 1024 * 1024

  function formatError(err) {
    if (!err) return 'Neznámá chyba'
    if (typeof err === 'string') return err
    const parts = [
      err.message,
      err.error,
      err.statusCode || err.status,
      err.code,
      err.details,
      err.hint,
    ].filter(Boolean)
    // unique-ish join
    return [...new Set(parts.map(String))].join(' · ')
  }

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

  function normalizeFile(file) {
    let type = (file.type || '').toLowerCase()
    if (!type || type === 'application/octet-stream') {
      const name = (file.name || '').toLowerCase()
      if (name.endsWith('.jpg') || name.endsWith('.jpeg')) type = 'image/jpeg'
      else if (name.endsWith('.png')) type = 'image/png'
      else if (name.endsWith('.webp')) type = 'image/webp'
    }
    if (type === 'image/jpg' || type === 'image/pjpeg') type = 'image/jpeg'
    if (type === file.type) return file
    return new File([file], file.name, { type, lastModified: file.lastModified })
  }

  function validateFiles(fileList) {
    const files = Array.from(fileList || []).map(normalizeFile)
    if (!files.length) return { ok: false, error: 'Vyberte alespoň jednu fotografii.' }
    for (const file of files) {
      if (!ALLOWED_TYPES[file.type]) {
        return {
          ok: false,
          error: `Nepodporovaný formát: ${file.name} (${file.type || 'neznámý typ'}). Povolené: JPEG, PNG, WebP.`,
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
    const normalized = normalizeFile(file)
    const ext = ALLOWED_TYPES[normalized.type]
    if (!ext) {
      const err = new Error(`Nepodporovaný typ: ${normalized.type || 'neznámý'}`)
      throw err
    }
    if (!userId) throw new Error('Chybí user id — nejste přihlášeni.')

    const path = `${userId}/${crypto.randomUUID()}.${ext}`
    const { error: uploadError } = await db.storage.from(GALLERY_BUCKET).upload(path, normalized, {
      contentType: normalized.type,
      upsert: false,
    })
    if (uploadError) {
      uploadError.message = `Storage: ${formatError(uploadError)}`
      throw uploadError
    }

    const { error: rowError } = await db.from('gallery_images').insert({
      storage_path: path,
      alt_text: (altText || '').trim() || normalized.name,
    })
    if (rowError) {
      await db.storage.from(GALLERY_BUCKET).remove([path])
      rowError.message = `DB gallery_images: ${formatError(rowError)}`
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
      if (delRow) {
        delRow.message = `DB delete: ${formatError(delRow)}`
        throw delRow
      }
    }
    if (path) {
      const { error: delFile } = await db.storage.from(GALLERY_BUCKET).remove([path])
      if (delFile) {
        delFile.message = `Storage delete: ${formatError(delFile)}`
        throw delFile
      }
    }
  }

  global.DospretonGallery = {
    db,
    configured,
    GALLERY_BUCKET,
    ALLOWED_TYPES,
    MAX_BYTES,
    formatError,
    publicUrl,
    fetchGalleryImages,
    validateFiles,
    uploadOne,
    deleteImage,
  }
})(window)
