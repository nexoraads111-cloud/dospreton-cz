/** Filter ids shared by Realizace UI + admin upload. */
export const GALLERY_CATEGORY_IDS = ['obklady', 'koupelny', 'kamen', 'schody']

export const GALLERY_CATEGORY_OPTIONS = [
  { id: 'obklady', label: 'Obklady' },
  { id: 'koupelny', label: 'Koupelny' },
  { id: 'kamen', label: 'Fasády / kámen' },
  { id: 'schody', label: 'Schody' },
]

const ALLOWED = new Set(GALLERY_CATEGORY_IDS)

/**
 * Resolve Realizace filter category for a Supabase row.
 * Prefer DB `category`; else infer from alt_text / path; else default «obklady».
 */
export function resolveGalleryCategory(row = {}) {
  const raw = String(row.category || '').trim().toLowerCase()
  if (ALLOWED.has(raw)) return raw

  const text = `${row.alt_text || row.alt || ''} ${row.storage_path || row.storagePath || ''}`.toLowerCase()
  if (/koupel|vana|sprch|bath/.test(text)) return 'koupelny'
  if (/schod|stairs|podest/.test(text)) return 'schody'
  if (/kamen|fas[aá]d|stone/.test(text)) return 'kamen'
  if (/obklad|dla[zž]|tile|terasa|balkon|chodba/.test(text)) return 'obklady'
  return 'obklady'
}
