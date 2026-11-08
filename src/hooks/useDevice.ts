import { useCallback, useEffect, useRef, useState } from 'react'

/** Hides the chrome after `ms` without input. `paused` keeps it visible (e.g. while a dialog is open). */
export function useIdle(ms: number, paused: boolean) {
  const [idle, setIdle] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const wake = useCallback(() => {
    setIdle(false)
    window.clearTimeout(timer.current)
    if (!paused) timer.current = window.setTimeout(() => setIdle(true), ms)
  }, [ms, paused])

  const hideNow = useCallback(() => {
    window.clearTimeout(timer.current)
    setIdle(true)
  }, [])

  useEffect(() => {
    wake()
    const events = ['pointermove', 'pointerdown', 'keydown', 'wheel'] as const
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }))
    return () => {
      window.clearTimeout(timer.current)
      events.forEach((e) => window.removeEventListener(e, wake))
    }
  }, [wake])

  return { idle, hideNow, wake }
}

/** Keeps the screen on for as long as the app is visible. */
export function useWakeLock() {
  const supported = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!supported) return
    let sentinel: WakeLockSentinel | null = null
    let disposed = false
    let pending = false

    const request = async () => {
      if (disposed || pending || document.visibilityState !== 'visible') return
      if (sentinel && !sentinel.released) return
      pending = true
      try {
        sentinel = await navigator.wakeLock.request('screen')
        if (disposed) {
          void sentinel.release()
          return
        }
        setActive(true)
        sentinel.addEventListener('release', () => setActive(false))
      } catch {
        setActive(false)
      } finally {
        pending = false
      }
    }

    void request()
    // Safari only grants the lock after a user gesture, and every browser drops it when the tab hides.
    const onVisible = () => void request()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('pointerdown', onVisible)
    return () => {
      disposed = true
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('pointerdown', onVisible)
      void sentinel?.release()
    }
  }, [supported])

  return { supported, active }
}

export function useFullscreen() {
  const supported = typeof document !== 'undefined' && document.fullscreenEnabled
  const [on, setOn] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement)

  useEffect(() => {
    const sync = () => setOn(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  const toggle = useCallback(() => {
    if (!supported) return
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {})
  }, [supported])

  return { supported, on, toggle }
}

export type CameraState =
  | { status: 'off' }
  | { status: 'starting' }
  | { status: 'live'; stream: MediaStream }
  | { status: 'error'; message: string }

/** Opens the front camera while `active` is true and releases it the moment it isn't. */
export function useCamera(active: boolean): CameraState {
  const [state, setState] = useState<CameraState>({ status: 'starting' })
  const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

  useEffect(() => {
    if (!active || !supported) return
    let stream: MediaStream | null = null
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        setState({ status: 'live', stream: s })
      })
      .catch((err: DOMException) => {
        if (cancelled) return
        const message =
          err.name === 'NotAllowedError'
            ? 'Camera access is blocked. Allow it from the camera icon in your address bar.'
            : err.name === 'NotReadableError'
              ? 'Your camera is busy, probably in your meeting app. Check your look in that app’s self-view instead.'
              : err.name === 'NotFoundError'
                ? 'No camera found on this device.'
                : 'Couldn’t start the camera. Try again in a moment.'
        setState({ status: 'error', message })
      })
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
      setState({ status: 'starting' })
    }
  }, [active, supported])

  if (!active) return { status: 'off' }
  if (!supported)
    return { status: 'error', message: 'This browser can’t open a camera here. Try Chrome, Edge or Safari over https.' }
  return state
}

export const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
