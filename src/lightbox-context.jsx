import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { gallery } from './photos'

const LightboxContext = createContext(null)

export function LightboxProvider({ children }) {
  const [index, setIndex] = useState(null)
  const open = index !== null

  const openAt = useCallback((i) => {
    if (typeof i !== 'number' || i < 0 || i >= gallery.length) return
    setIndex(i)
  }, [])

  const openImage = useCallback(
    (imagePath) => {
      const i = gallery.findIndex((g) => g.image === imagePath)
      openAt(i >= 0 ? i : 0)
    },
    [openAt],
  )

  const close = useCallback(() => setIndex(null), [])

  const prev = useCallback(() => {
    setIndex((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length))
  }, [])

  const next = useCallback(() => {
    setIndex((i) => (i === null ? i : (i + 1) % gallery.length))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, close, prev, next])

  const value = useMemo(
    () => ({ open, index, item: open ? gallery[index] : null, openAt, openImage, close, prev, next, total: gallery.length }),
    [open, index, openAt, openImage, close, prev, next],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider')
  return ctx
}
