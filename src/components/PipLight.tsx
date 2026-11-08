import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { type Look, lookName } from '../lib/light'
import { LightStage } from './LightStage'

/** The light, rendered into the Document Picture-in-Picture window. Controls appear on hover. */
export function PipLight({
  win,
  look,
  onStep,
  onBrightness,
  onClose,
}: {
  win: Window
  look: Look
  onStep: (dir: 1 | -1) => void
  onBrightness: (delta: number) => void
  onClose: () => void
}) {
  return createPortal(
    <div className="pip">
      <LightStage look={look} />
      <div className="pip__bar" role="toolbar" aria-label="Light controls">
        <button type="button" className="pip__btn" aria-label="Previous look" onClick={() => onStep(-1)}>
          <ChevronLeft size={16} aria-hidden />
        </button>
        <span className="pip__name">{lookName(look)}</span>
        <button type="button" className="pip__btn" aria-label="Next look" onClick={() => onStep(1)}>
          <ChevronRight size={16} aria-hidden />
        </button>
        <span className="pip__sep" aria-hidden="true" />
        <button type="button" className="pip__btn" aria-label="Dimmer" onClick={() => onBrightness(-10)} disabled={look.brightness <= 30}>
          <Minus size={14} aria-hidden />
        </button>
        <span className="pip__val mono">{look.brightness}%</span>
        <button type="button" className="pip__btn" aria-label="Brighter" onClick={() => onBrightness(10)} disabled={look.brightness >= 100}>
          <Plus size={14} aria-hidden />
        </button>
      </div>
      <button type="button" className="pip__btn pip__close" aria-label="Close pop-out light" onClick={onClose}>
        <X size={14} aria-hidden />
      </button>
    </div>,
    win.document.body,
  )
}
