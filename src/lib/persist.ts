import { useEffect, useState } from 'react'

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as T
    // Merge objects so new fields get defaults after an update.
    if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) return { ...fallback, ...parsed }
    return parsed
  } catch {
    return fallback
  }
}

/** useState that survives reloads. Storage failures (private mode etc.) are ignored. */
export function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => read(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable — keep working in memory */
    }
  }, [key, value])
  return [value, setValue] as const
}
