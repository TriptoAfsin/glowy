import { type CSSProperties, type KeyboardEvent, type ReactNode, useId, useRef } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  /** Accessible value text, e.g. "5600 kelvin". */
  valueText?: string
  onChange: (v: number) => void
  /** Optional paint for the track, e.g. a warm → cool gradient. */
  track?: string
  /** Draw instrument tick marks above the track. */
  ticks?: boolean
  /** Small inline variant with its label and value on one row. */
  mini?: { display: string }
}

/** A thin instrument slider: hairline track, bar-shaped thumb. Native range input underneath. */
export function Slider({ label, value, min, max, step = 1, valueText, onChange, track, ticks, mini }: SliderProps) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  const input = (
    <span className="slider__track" data-ticks={ticks ? '' : undefined}>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={mini ? undefined : label}
        aria-valuetext={valueText}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${fill}%`, ...(track ? { '--track': track } : {}) } as CSSProperties}
        data-painted={track ? '' : undefined}
      />
    </span>
  )
  if (!mini) return <div className="slider">{input}</div>
  return (
    <div className="slider slider--mini">
      <label htmlFor={id}>{label}</label>
      {input}
      <output htmlFor={id} className="mono">
        {mini.display}
      </output>
    </div>
  )
}

interface SegmentedProps<T extends string> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  variant?: 'boxed' | 'text'
}

/** Radio group with roving focus. `text` variant is a row of quiet text tabs. */
export function Segmented<T extends string>({ label, value, options, onChange, variant = 'boxed' }: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    e.stopPropagation()
    const next = (i + dir + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus({ preventScroll: true })
  }
  return (
    <div className={`seg seg--${variant}`} role="radiogroup" aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => onKey(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function IconButton({
  label,
  onClick,
  children,
  pressed,
  shortcut,
  className = 'icon-btn',
}: {
  label: string
  onClick: () => void
  children: ReactNode
  pressed?: boolean
  shortcut?: string
  className?: string
}) {
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={pressed}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
