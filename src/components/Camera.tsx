import { Maximize2, X } from 'lucide-react'
import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react'
import type { CameraState } from '../hooks/useDevice'
import { usePersisted } from '../lib/persist'

export function CameraVideo({ stream, className }: { stream: MediaStream; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current && ref.current.srcObject !== stream) ref.current.srcObject = stream
  }, [stream])
  return <video ref={ref} className={className} autoPlay playsInline muted />
}

export function CameraFallback({ camera }: { camera: CameraState }) {
  if (camera.status === 'error') return <p className="cam-msg">{camera.message}</p>
  return (
    <p className="cam-msg cam-msg--wait" aria-live="polite">
      Waking up the camera…
    </p>
  )
}

const SIZE = 168

/** A small draggable round mirror, so you can check your face while you adjust the light. */
export function Mirror({
  camera,
  onClose,
  onExpand,
}: {
  camera: CameraState
  onClose: () => void
  onExpand: () => void
}) {
  // Position stored as a fraction of the viewport so it survives resizes.
  const [pos, setPos] = usePersisted('glowy.mirror', { x: 0.82, y: 0.2 })
  const [dragging, setDragging] = useState(false)
  const start = useRef({ px: 0, py: 0, x: 0, y: 0 })

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y }
    setDragging(true)
  }
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const w = window.innerWidth
    const h = window.innerHeight
    const x = start.current.x + (e.clientX - start.current.px) / w
    const y = start.current.y + (e.clientY - start.current.py) / h
    const mx = SIZE / 2 / w
    const my = SIZE / 2 / h
    setPos({ x: Math.min(1 - mx, Math.max(mx, x)), y: Math.min(1 - my, Math.max(my, y)) })
  }

  return (
    <div
      className="mirror"
      data-dragging={dragging}
      style={{ '--x': pos.x, '--y': pos.y } as CSSProperties}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      role="group"
      aria-label="Camera mirror. Drag to move."
    >
      <div className="mirror__lens">
        {camera.status === 'live' ? (
          <CameraVideo stream={camera.stream} className="mirrored" />
        ) : (
          <CameraFallback camera={camera} />
        )}
      </div>
      <button type="button" className="mirror__btn mirror__btn--close" aria-label="Close mirror" onClick={onClose}>
        <X size={14} aria-hidden />
      </button>
      <button type="button" className="mirror__btn mirror__btn--expand" aria-label="Open meeting preview" onClick={onExpand}>
        <Maximize2 size={14} aria-hidden />
      </button>
    </div>
  )
}
