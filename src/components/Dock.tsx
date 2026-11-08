import { ChevronDown, ChevronUp, X } from 'lucide-react'
import type { CSSProperties, MouseEvent } from 'react'
import {
  KELVIN_MAX,
  KELVIN_MIN,
  type Look,
  SCENES,
  type Shape,
  TONES,
  lookName,
  lookSwatch,
  sceneById,
  toneColor,
} from '../lib/light'
import { IconButton, Segmented, Slider } from './controls'

export type LookTab = 'tone' | 'glow' | 'saved'

export interface Preset {
  id: string
  look: Look
}

export const MAX_PRESETS = 8

interface DockProps {
  look: Look
  setLook: (patch: Partial<Look>) => void
  tab: LookTab
  onTab: (t: LookTab) => void
  presets: Preset[]
  onSave: (e: MouseEvent<HTMLButtonElement>) => void
  onApply: (p: Preset) => void
  onDelete: (id: string) => void
  onPreview: () => void
  minimised: boolean
  onMinimise: (m: boolean) => void
}

const SHAPES: { value: Shape; label: string }[] = [
  { value: 'fill', label: 'Fill' },
  { value: 'halo', label: 'Halo' },
  { value: 'edge', label: 'Edge' },
]

const DRIFT_WORDS: Record<string, string> = { '0.5': 'Still', '0.75': 'Slow', '1': 'Calm', '1.25': 'Easy', '1.5': 'Lively', '1.75': 'Brisk', '2': 'Busy' }

const sameLook = (a: Look, b: Look) =>
  a.source === b.source &&
  a.shape === b.shape &&
  a.brightness === b.brightness &&
  (a.source === 'scene' ? a.sceneId === b.sceneId : a.kelvin === b.kelvin && a.blush === b.blush)

/** The A1 "instrument strip": look · colour · output · actions, with a minimised pill state. */
export function Dock(p: DockProps) {
  const { look, setLook } = p
  const [a, b] = lookSwatch(look)
  const meta = `${look.source === 'scene' ? 'glow' : 'tone'} · ${look.shape}`

  if (p.minimised) {
    return (
      <section className="dock dock--min chrome" aria-label="Light controls, minimised">
        <span className="sw sw--static" style={{ '--a': a, '--b': b } as CSSProperties} aria-hidden="true" />
        <span className="dock-min__name">{lookName(look)}</span>
        <span className="dock-min__val mono">{look.brightness}%</span>
        <IconButton className="ghost-icon" label="Show controls" shortcut="M" onClick={() => p.onMinimise(false)}>
          <ChevronUp size={18} aria-hidden />
        </IconButton>
      </section>
    )
  }

  return (
    <section className="dock chrome" aria-label="Light controls">
      <IconButton className="dock__min" label="Minimise controls" shortcut="M" onClick={() => p.onMinimise(true)}>
        <ChevronDown size={16} aria-hidden />
      </IconButton>

      {/* ── Look ── */}
      <div className="zone zone--look">
        <div className="zone__head">
          <h2>Look</h2>
          <Segmented<LookTab>
            label="Look type"
            variant="text"
            value={p.tab}
            onChange={(t) => {
              p.onTab(t)
              if (t === 'tone') setLook({ source: 'tone' })
              if (t === 'glow') setLook({ source: 'scene' })
            }}
            options={[
              { value: 'tone', label: 'Tone' },
              { value: 'glow', label: 'Glow' },
              { value: 'saved', label: p.presets.length ? `Saved ${p.presets.length}` : 'Saved' },
            ]}
          />
        </div>

        <div className="swatches" role="radiogroup" aria-label={p.tab === 'saved' ? 'Saved looks' : 'Looks'}>
          {p.tab === 'tone' &&
            TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                className="sw"
                aria-label={t.name}
                title={t.name}
                aria-checked={look.source === 'tone' && look.kelvin === t.kelvin && look.blush === t.blush}
                style={{ '--a': toneColor(t.kelvin, t.blush), '--b': toneColor(t.kelvin, t.blush) } as CSSProperties}
                onClick={() => setLook({ source: 'tone', kelvin: t.kelvin, blush: t.blush })}
              />
            ))}
          {p.tab === 'glow' &&
            SCENES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                className="sw"
                aria-label={s.name}
                title={s.name}
                aria-checked={look.source === 'scene' && look.sceneId === s.id}
                style={{ '--a': s.blobs[0], '--b': s.blobs[1] } as CSSProperties}
                onClick={() => setLook({ source: 'scene', sceneId: s.id })}
              />
            ))}
          {p.tab === 'saved' &&
            (p.presets.length === 0 ? (
              <p className="empty">Tap Save look to keep the current light here.</p>
            ) : (
              p.presets.map((pr) => {
                const [pa, pb] = lookSwatch(pr.look)
                return (
                  <span key={pr.id} className="saved">
                    <button
                      type="button"
                      role="radio"
                      className="sw"
                      aria-label={lookName(pr.look)}
                      title={`${lookName(pr.look)} · ${pr.look.brightness}%`}
                      aria-checked={sameLook(pr.look, look)}
                      style={{ '--a': pa, '--b': pb } as CSSProperties}
                      onClick={() => p.onApply(pr)}
                    />
                    <button
                      type="button"
                      className="saved__x"
                      aria-label={`Delete ${lookName(pr.look)}`}
                      onClick={() => p.onDelete(pr.id)}
                    >
                      <X size={10} aria-hidden />
                    </button>
                  </span>
                )
              })
            ))}
        </div>

        <div className="zone__name">
          <b>{lookName(look)}</b>
          <span className="mono">{meta}</span>
        </div>
      </div>

      {/* ── Colour ── */}
      <div className="zone">
        {look.source === 'tone' ? (
          <>
            <div className="zone__head">
              <h2>Temperature</h2>
            </div>
            <div className="readout">
              <b className="mono">{look.kelvin}</b>
              <span className="mono">K</span>
            </div>
            <Slider
              label="Warmth"
              ticks
              value={KELVIN_MAX + KELVIN_MIN - look.kelvin}
              min={KELVIN_MIN}
              max={KELVIN_MAX}
              step={50}
              valueText={`${look.kelvin} kelvin`}
              track={`linear-gradient(90deg, ${toneColor(KELVIN_MAX, 0)}, ${toneColor(KELVIN_MIN, 0)})`}
              onChange={(v) => setLook({ source: 'tone', kelvin: KELVIN_MAX + KELVIN_MIN - v })}
            />
            <Slider
              label="Blush"
              mini={{ display: `${look.blush}%` }}
              value={look.blush}
              min={0}
              max={100}
              onChange={(blush) => setLook({ source: 'tone', blush })}
            />
          </>
        ) : (
          <>
            <div className="zone__head">
              <h2>Drift</h2>
            </div>
            <div className="readout">
              <b className="mono">{DRIFT_WORDS[String(look.drift)] ?? `${look.drift}×`}</b>
            </div>
            <Slider
              label="Drift speed"
              ticks
              value={look.drift}
              min={0.5}
              max={2}
              step={0.25}
              valueText={DRIFT_WORDS[String(look.drift)]}
              onChange={(drift) => setLook({ drift })}
            />
            <p className="zone__hint">{sceneById(look.sceneId).name} moves slowly enough not to flicker on camera.</p>
          </>
        )}
      </div>

      {/* ── Output ── */}
      <div className="zone">
        <div className="zone__head">
          <h2>Output</h2>
        </div>
        <div className="readout">
          <b className="mono">{look.brightness}</b>
          <span className="mono">%</span>
        </div>
        <Slider
          label="Brightness"
          ticks
          value={look.brightness}
          min={30}
          max={100}
          valueText={`${look.brightness} percent`}
          onChange={(brightness) => setLook({ brightness })}
        />
        <Segmented<Shape> label="Shape" value={look.shape} onChange={(shape) => setLook({ shape })} options={SHAPES} />
        {look.shape !== 'fill' && (
          <Slider
            label="Width"
            mini={{ display: String(look.shapeSize) }}
            value={look.shapeSize}
            min={10}
            max={45}
            onChange={(shapeSize) => setLook({ shapeSize })}
          />
        )}
      </div>

      {/* ── Actions ── */}
      <div className="zone--go">
        <button type="button" className="btn btn--primary" onClick={p.onPreview}>
          Preview call
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={p.onSave}
          disabled={p.presets.length >= MAX_PRESETS}
          title={p.presets.length >= MAX_PRESETS ? `You can keep up to ${MAX_PRESETS} looks` : undefined}
        >
          {p.presets.length >= MAX_PRESETS ? 'Saved list full' : 'Save look'}
        </button>
      </div>
    </section>
  )
}
