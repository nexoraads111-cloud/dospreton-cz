import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useGallery } from './gallery-context'

const LightboxContext = createContext(null)

export function LightboxProvider({ children }) {
  const { items } = useGallery()
  const [index, setIndex] = useState(null)
  const open = index !== null

  const openAt = useCallback(
    (i) => {
      if (typeof i !== 'number' || i < 0 || i >= items.length) return
      setIndex(i)
    },
    [items.length],
  )

  const openImage = useCallback(
    (imagePath) => {
      const i = items.findIndex((g) => g.image === imagePath)
      openAt(i >= 0 ? i : 0)
    },
    [items, openAt],
  )

  const close = useCallback(() => setIndex(null), [])

  const prev = useCallback(() => {
    setIndex((i) => {
      if (i === null || items.length === 0) return i
      return (i - 1 + items.length) % items.length
    })
  }, [items.length])

  const next = useCallback(() => {
    setIndex((i) => {
      if (i === null || items.length === 0) return i
      return (i + 1) % items.length
    })
  }, [items.length])

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

  // Clamp index if gallery shrinks while open
  useEffect(() => {
    if (index !== null && index >= items.length) {
      setIndex(items.length ? items.length - 1 : null)
    }
  }, [items.length, index])

  const value = useMemo(
    () => ({
      open,
      index,
      item: open ? items[index] : null,
      openAt,
      openImage,
      close,
      prev,
      next,
      total: items.length,
    }),
    [open, index, items, openAt, openImage, close, prev, next],
  )

  return <LightboxContext.Provider value={value}>{children}</LightboxContext.Provider>
}

export function useLightbox() {
  const ctx = useContext(LightboxContext)
  if (!ctx) throw new Error('useLightbox must be used within LightboxProvider')
  return ctx
}
