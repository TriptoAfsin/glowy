// The light itself. These colours are product content (what lights your face),
// not UI chrome, so they live here as data rather than in tokens.css.

export type Source = 'tone' | 'scene'
export type Shape = 'fill' | 'halo' | 'edge'

export interface Look {
  source: Source
  /** Colour temperature for tone mode, 2700–6500 K. */
  kelvin: number
  /** 0–100: how far the tone leans toward a soft rose. */
  blush: number
  sceneId: string
  /** Glow drift speed multiplier, 0.5–2. */
  drift: number
  shape: Shape
  /** 10–45: ring / edge thickness. */
  shapeSize: number
  /** 30–100 %. */
  brightness: number
}

export const DEFAULT_LOOK: Look = {
  source: 'tone',
  kelvin: 4300,
  blush: 15,
  sceneId: 'sunrise',
  drift: 1,
  shape: 'fill',
  shapeSize: 24,
  brightness: 100,
}

export const KELVIN_MIN = 2700
export const KELVIN_MAX = 6500

export interface Tone {
  id: string
  name: string
  kelvin: number
  blush: number
}

export const TONES: Tone[] = [
  { id: 'daylight', name: 'Daylight', kelvin: 6500, blush: 0 },
  { id: 'soft', name: 'Soft white', kelvin: 5200, blush: 8 },
  { id: 'warm', name: 'Warm', kelvin: 4300, blush: 15 },
  { id: 'golden', name: 'Golden', kelvin: 3300, blush: 10 },
  { id: 'peach', name: 'Peach', kelvin: 3800, blush: 45 },
  { id: 'rose', name: 'Rose', kelvin: 4800, blush: 80 },
]

export interface Scene {
  id: string
  name: string
  base: string
  blobs: [string, string, string]
  rays?: boolean
}

export const SCENES: Scene[] = [
  { id: 'clearsky', name: 'Clear sky', base: '#EAF4FF', blobs: ['#CBE6FF', '#FFF5D6', '#F4F9FF'] },
  { id: 'sunrise', name: 'Sunrise', base: '#FFE4C8', blobs: ['#FFC49E', '#FFE18C', '#FFF4E2'] },
  { id: 'golden', name: 'Golden hour', base: '#FFD889', blobs: ['#FFB64C', '#FFEAB0', '#FFCB6A'] },
  { id: 'sunbeam', name: 'Sunbeam', base: '#FFF3DA', blobs: ['#FFE3A6', '#FFFAF0', '#FFE9C2'], rays: true },
  { id: 'peach', name: 'Peach fizz', base: '#FFDCC8', blobs: ['#FFBFA0', '#FFEBD9', '#FFCDB2'] },
  { id: 'rose', name: 'Rose quartz', base: '#FFE0DE', blobs: ['#FFC4CC', '#FFEDE2', '#FAD0E0'] },
  { id: 'moonmilk', name: 'Moonmilk', base: '#F5F1FF', blobs: ['#E5DEFF', '#FFF6EC', '#FCE6F0'] },
]

export const sceneById = (id: string) => SCENES.find((s) => s.id === id) ?? SCENES[0]

type RGB = [number, number, number]
const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)))

/** Tanner Helland's black-body approximation. */
export function kelvinToRgb(kelvin: number): RGB {
  const t = kelvin / 100
  let r: number
  let g: number
  let b: number
  if (t <= 66) {
    r = 255
    g = 99.4708025861 * Math.log(t) - 161.1195681661
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592)
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492)
    b = 255
  }
  return [clamp(r), clamp(g), clamp(b)]
}

const BLUSH: RGB = [255, 184, 196]

export function toneColor(kelvin: number, blush: number): string {
  const base = kelvinToRgb(kelvin)
  const k = (blush / 100) * 0.55
  const mixed = base.map((c, i) => clamp(c + (BLUSH[i] - c) * k))
  return `rgb(${mixed.join(' ')})`
}

/** One representative colour for the current look — used by the meeting simulation and saved-look swatches. */
export function lookColor(look: Look): string {
  if (look.source === 'scene') return sceneById(look.sceneId).blobs[0]
  return toneColor(look.kelvin, look.blush)
}

export function lookSwatch(look: Look): [string, string] {
  if (look.source === 'scene') {
    const s = sceneById(look.sceneId)
    return [s.blobs[0], s.blobs[1]]
  }
  const c = toneColor(look.kelvin, look.blush)
  return [c, c]
}

const SHAPE_NAMES: Record<Shape, string> = { fill: 'Fill', halo: 'Halo', edge: 'Edge' }

export function lookName(look: Look): string {
  const light =
    look.source === 'scene'
      ? sceneById(look.sceneId).name
      : (TONES.find((t) => Math.abs(t.kelvin - look.kelvin) < 60 && Math.abs(t.blush - look.blush) < 4)?.name ??
        `${Math.round(look.kelvin / 50) * 50} K`)
  return look.shape === 'fill' ? light : `${light} · ${SHAPE_NAMES[look.shape]}`
}
