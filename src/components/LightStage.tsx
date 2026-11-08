import type { CSSProperties } from 'react'
import { type Look, sceneById, toneColor } from '../lib/light'

/**
 * The light itself: a tone or an animated glow, shaped (fill / halo / edge) and dimmed.
 * Colours are registered CSS properties (see app.css), so every change crossfades.
 */
export function LightStage({ look }: { look: Look }) {
  const scene = sceneById(look.sceneId)
  const isScene = look.source === 'scene'

  const style = {
    '--tone': toneColor(look.kelvin, look.blush),
    '--scene-base': scene.base,
    '--blob-a': scene.blobs[0],
    '--blob-b': scene.blobs[1],
    '--blob-c': scene.blobs[2],
    '--drift': String(1 / look.drift),
    '--shape-size': String(look.shapeSize),
    '--dim': String(((100 - look.brightness) / 100) * 0.88),
  } as CSSProperties

  return (
    <div className="stage" style={style} aria-hidden="true">
      <div className="stage__scene" data-on={isScene}>
        <span className="blob blob--a" />
        <span className="blob blob--b" />
        <span className="blob blob--c" />
        <span className="rays" data-on={!!scene.rays} />
      </div>
      <div className="shape shape--halo" data-on={look.shape === 'halo'} />
      <div className="shape shape--edge" data-on={look.shape === 'edge'}>
        <span className="edge-hole" />
      </div>
      <div className="stage__dim" />
    </div>
  )
}
