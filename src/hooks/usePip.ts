import { useCallback, useEffect, useRef, useState } from 'react'
import { type Look, sceneById, toneColor } from '../lib/light'

/**
 * Pop the light out into an always-on-top window.
 * - Chromium (Chrome / Edge 116+): Document Picture-in-Picture → the real React light + controls, kept in sync.
 * - Safari and other browsers with video PiP: the light is drawn to a canvas and streamed into a PiP <video>.
 */
export type PipMode = 'document' | 'video'

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow(options?: { width?: number; height?: number; disallowReturnToOpener?: boolean }): Promise<Window>
      window: Window | null
    }
  }
}

function copyStyles(target: Document) {
  // Resolve relative font/asset URLs against the app, not about:blank.
  const base = target.createElement('base')
  base.href = document.baseURI
  target.head.appendChild(base)
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const style = target.createElement('style')
      style.textContent = Array.from(sheet.cssRules)
        .map((r) => r.cssText)
        .join('\n')
      target.head.appendChild(style)
    } catch {
      if (sheet.href) {
        const link = target.createElement('link')
        link.rel = 'stylesheet'
        link.href = sheet.href
        target.head.appendChild(link)
      }
    }
  }
}

// ───────────── canvas renderer for the video fallback ─────────────

const hexToRgba = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function nightColor() {
  const v = getComputedStyle(document.documentElement).getPropertyValue('--color-night').trim()
  return v || '#0b0f17'
}

export function drawLight(ctx: CanvasRenderingContext2D, w: number, h: number, look: Look, t: number, night: string) {
  ctx.globalAlpha = 1
  if (look.source === 'tone') {
    ctx.fillStyle = toneColor(look.kelvin, look.blush)
    ctx.fillRect(0, 0, w, h)
  } else {
    const s = sceneById(look.sceneId)
    ctx.fillStyle = s.base
    ctx.fillRect(0, 0, w, h)
    const speed = look.drift / 9
    const R = Math.max(w, h) * 0.85
    s.blobs.forEach((c, i) => {
      const ph = i * 2.1
      const x = w * (0.5 + 0.38 * Math.sin(t * speed * (0.7 + i * 0.23) + ph))
      const y = h * (0.5 + 0.38 * Math.cos(t * speed * (0.6 + i * 0.19) + ph * 1.3))
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * (0.8 + i * 0.1))
      g.addColorStop(0, hexToRgba(c, 1))
      g.addColorStop(1, hexToRgba(c, 0))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
    })
  }
  const m = Math.min(w, h)
  if (look.shape === 'halo') {
    const r = m / 2
    const r1 = (90 - look.shapeSize * 1.35) / 100
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, r * 1.3)
    const stop = (p: number) => Math.min(1, p / 1.3)
    g.addColorStop(0, night)
    g.addColorStop(stop(r1), night)
    g.addColorStop(stop(r1 + 0.07), 'rgba(0,0,0,0)')
    g.addColorStop(stop(0.93), 'rgba(0,0,0,0)')
    g.addColorStop(1, night)
    ctx.globalAlpha = 0.9
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  } else if (look.shape === 'edge') {
    const inset = (look.shapeSize * 0.42 * m) / 100
    ctx.save()
    ctx.shadowColor = night
    ctx.shadowBlur = (look.shapeSize * 0.6 * m) / 100
    ctx.fillStyle = night
    const rr = (look.shapeSize * 0.5 * m) / 100 + 12
    ctx.beginPath()
    ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, rr)
    ctx.fill()
    ctx.restore()
  }
  const dim = ((100 - look.brightness) / 100) * 0.88
  if (dim > 0) {
    ctx.globalAlpha = dim
    ctx.fillStyle = night
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }
}

// ───────────── the hook ─────────────

export function usePip(look: Look) {
  const docSupported = typeof window !== 'undefined' && 'documentPictureInPicture' in window
  const videoSupported =
    typeof document !== 'undefined' &&
    document.pictureInPictureEnabled &&
    typeof HTMLCanvasElement !== 'undefined' &&
    'captureStream' in HTMLCanvasElement.prototype
  const mode: PipMode | null = docSupported ? 'document' : videoSupported ? 'video' : null

  const [win, setWin] = useState<Window | null>(null)
  const [videoOpen, setVideoOpen] = useState(false)
  const lookRef = useRef(look)
  useEffect(() => {
    lookRef.current = look
  }, [look])
  const videoRef = useRef<{ video: HTMLVideoElement; timer: number } | null>(null)

  const closeVideo = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    window.clearInterval(v.timer)
    ;(v.video.srcObject as MediaStream | null)?.getTracks().forEach((t) => t.stop())
    v.video.remove()
    videoRef.current = null
    setVideoOpen(false)
  }, [])

  const openVideo = useCallback(async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 600
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const night = nightColor()
    const start = performance.now()
    const paint = () => drawLight(ctx, canvas.width, canvas.height, lookRef.current, (performance.now() - start) / 1000, night)
    paint()
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.className = 'pip-source'
    video.srcObject = canvas.captureStream(30)
    document.body.appendChild(video)
    // setInterval (not rAF) so the light keeps updating while this tab is in the background.
    const timer = window.setInterval(paint, 1000 / 30)
    videoRef.current = { video, timer }
    video.addEventListener('leavepictureinpicture', closeVideo, { once: true })
    try {
      await video.play()
      await video.requestPictureInPicture()
      setVideoOpen(true)
    } catch {
      closeVideo()
    }
  }, [closeVideo])

  const open = useCallback(async () => {
    if (mode === 'document' && window.documentPictureInPicture) {
      try {
        const w = await window.documentPictureInPicture.requestWindow({ width: 340, height: 520 })
        copyStyles(w.document)
        w.document.title = 'Glowy light'
        w.document.documentElement.classList.add('pip-doc')
        w.addEventListener('pagehide', () => setWin(null), { once: true })
        setWin(w)
      } catch {
        /* user dismissed or the browser refused */
      }
    } else if (mode === 'video') {
      await openVideo()
    }
  }, [mode, openVideo])

  const close = useCallback(() => {
    win?.close()
    setWin(null)
    if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => {})
    closeVideo()
  }, [win, closeVideo])

  useEffect(() => () => closeVideo(), [closeVideo])

  const isOpen = !!win || videoOpen
  const toggle = useCallback(() => (isOpen ? close() : void open()), [isOpen, open, close])

  return { mode, supported: mode !== null, isOpen, win, toggle, close }
}
