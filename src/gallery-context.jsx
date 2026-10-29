import { createContext, useContext, useMemo } from 'react'
import { CATEGORIES, gallery as staticGallery } from './photos'

const GalleryContext = createContext(null)

/**
 * React gallery = local client photos only.
 * Supabase uploads are shown by the vanilla section (`js/public-gallery.js`).
 */
export function GalleryProvider({ children }) {
  const value = useMemo(
    () => ({
      items: staticGallery.map((g) => ({ ...g, source: 'static' })),
      remote: [],
      staticCount: staticGallery.length,
      filters: CATEGORIES,
      status: 'static',
      error: null,
      refresh: async () => {},
      configured: false,
    }),
    [],
  )

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider')
  return ctx
}
