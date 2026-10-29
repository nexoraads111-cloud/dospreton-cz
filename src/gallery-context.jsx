import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { CATEGORIES, gallery as staticGallery } from './photos'
import { fetchRemoteGallery } from './lib/gallery-api'
import { isSupabaseConfigured } from './lib/supabase'

const GalleryContext = createContext(null)

const FILTERS = [
  ...CATEGORIES,
  { id: 'nahrane', label: 'Nahrané' },
]

export function GalleryProvider({ children }) {
  const [remote, setRemote] = useState([])
  const [status, setStatus] = useState(isSupabaseConfigured ? 'loading' : 'static')
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setRemote([])
      setStatus('static')
      setError(null)
      return
    }
    setStatus('loading')
    try {
      const rows = await fetchRemoteGallery()
      setRemote(rows)
      setStatus('ready')
      setError(null)
    } catch (err) {
      console.error(err)
      setError(err)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const items = useMemo(() => {
    // Remote first (newest uploads), then original client photos
    const staticItems = staticGallery.map((g) => ({ ...g, source: 'static' }))
    return [...remote, ...staticItems]
  }, [remote])

  const value = useMemo(
    () => ({
      items,
      remote,
      staticCount: staticGallery.length,
      filters: FILTERS,
      status,
      error,
      refresh,
      configured: isSupabaseConfigured,
    }),
    [items, remote, status, error, refresh],
  )

  return <GalleryContext.Provider value={value}>{children}</GalleryContext.Provider>
}

export function useGallery() {
  const ctx = useContext(GalleryContext)
  if (!ctx) throw new Error('useGallery must be used within GalleryProvider')
  return ctx
}
