import { MicOff, X } from 'lucide-react'
import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from 'react'
import type { CameraState } from '../hooks/useDevice'
import { type Look, lookColor } from '../lib/light'
import { CameraFallback, CameraVideo } from './Camera'
import { Segmented } from './controls'

type Mode = 'live' | 'compare'

/**
 * Shows your camera the way a call would: a 16:9 tile in a grid.
 * "Compare" puts a simulated glow over one side, so you can preview a look
 * even when the screen is too small (or too far) to light you for real.
 */
export function MeetingPreview({
  open,
  onClose,
  camera,
  look,
}: {
  open: boolean
  onClose: () => void
  camera: CameraState
  look: Look
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [mode, setMode] = useState<Mode>('compare')
  const [split, setSplit] = useState(50)
  const tile = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  const setFromPointer = (e: PointerEvent) => {
    const r = tile.current?.getBoundingClientRect()
    if (!r) return
    setSplit(Math.round(Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100))))
  }

  const strength = look.brightness / 100
  const shapeBoost = look.shape === 'fill' ? 1 : look.shape === 'halo' ? 0.85 : 0.7
  const simStyle = {
    '--sim': lookColor(look),
    '--sim-strength': String(0.62 * strength * shapeBoost),
    '--split': `${split}%`,
  } as CSSProperties

  return (
    <dialog
      ref={dialog}
      className="preview"
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-labelledby="preview-title"
    >
      <div className="preview__card">
        <header className="preview__head">
          <div>
            <h2 id="preview-title">How you’ll look in a call</h2>
            <p className="hint">Mirrored like a self-view. Other people see you the right way round.</p>
          </div>
          <button type="button" className="icon-btn" aria-label="Close preview" onClick={onClose}>
            <X size={18} aria-hidden />
          </button>
        </header>

        <Segmented<Mode>
          label="Preview mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'compare', label: 'Compare' },
            { value: 'live', label: 'Camera only' },
          ]}
        />

        <div className="call-grid">
          <div
            ref={tile}
            className="call-tile call-tile--you"
            style={simStyle}
            data-mode={mode}
            onPointerDown={(e) => {
              if (mode !== 'compare') return
              dragging.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              setFromPointer(e)
            }}
            onPointerMove={(e) => dragging.current && setFromPointer(e)}
            onPointerUp={() => (dragging.current = false)}
          >
            {camera.status === 'live' ? (
              <>
                <CameraVideo stream={camera.stream} className="mirrored" />
                {mode === 'compare' && (
                  <>
                    <div className="sim" aria-hidden="true">
                      <CameraVideo stream={camera.stream} className="mirrored sim__video" />
                      <span className="sim__light" />
                    </div>
                    <span className="split-handle" aria-hidden="true" />
                    <span className="tile-tag tile-tag--left">Camera now</span>
                    <span className="tile-tag tile-tag--right">With this look (simulated)</span>
                    <input
                      className="sr-only"
                      type="range"
                      min={5}
                      max={95}
                      value={split}
                      onChange={(e) => setSplit(Number(e.target.value))}
                      aria-label="Compare divider position"
                    />
                  </>
                )}
              </>
            ) : (
              <CameraFallback camera={camera} />
            )}
            <span className="name-tag">
              <MicOff size={13} aria-hidden /> You
            </span>
          </div>
          <div className="call-tile call-tile--other" aria-hidden="true" />
          <div className="call-tile call-tile--other" aria-hidden="true" />
        </div>

        <p className="hint">
          “Camera now” is your real feed, already lit by this screen. The simulated side shows the current look at
          full strength. Drag across the tile to compare.
        </p>
      </div>
    </dialog>
  )
}
