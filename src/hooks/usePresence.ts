import { useEffect, useState } from 'react'

/**
 * Keeps an element mounted for `ms` after `open` turns false, so it can play an exit animation.
 * Returns `mounted` (render it) and `closing` (apply the exit styles).
 */
export function usePresence(open: boolean, ms: number) {
  const [shown, setShown] = useState(open)
  // Adjusting state during render is React's sanctioned pattern for derived state.
  if (open && !shown) setShown(true)

  useEffect(() => {
    if (open || !shown) return
    const t = window.setTimeout(() => setShown(false), ms)
    return () => window.clearTimeout(t)
  }, [open, shown, ms])

  return { mounted: shown, closing: shown && !open }
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
