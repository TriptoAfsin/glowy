import { Camera, EyeOff, Maximize, Minimize, Video } from 'lucide-react'
import { type MouseEvent, useCallback, useEffect, useState } from 'react'
import { Mirror } from './components/Camera'
import { IconButton } from './components/controls'
import { Dock, type LookTab, MAX_PRESETS, type Preset } from './components/Dock'
import { LightStage } from './components/LightStage'
import { MeetingPreview } from './components/MeetingPreview'
import { Sunny } from './components/Sunny'
import { isTouch, useCamera, useFullscreen, useIdle, useWakeLock } from './hooks/useDevice'
import { DEFAULT_LOOK, type Look, SCENES, TONES } from './lib/light'
import { usePersisted } from './lib/persist'

export default function App() {
  const [look, setLookState] = usePersisted<Look>('glowy.look', DEFAULT_LOOK)
  const [presets, setPresets] = usePersisted<Preset[]>('glowy.presets', [])
  const [tipSeen, setTipSeen] = usePersisted('glowy.tip', false)
  const [minimised, setMinimised] = usePersisted('glowy.dock-min', false)
  const [tab, setTab] = useState<LookTab>(() => (look.source === 'scene' ? 'glow' : 'tone'))
  const [mirrorOn, setMirrorOn] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [dockHover, setDockHover] = useState(false)
  const [cheer, setCheer] = useState(0)
  const [touch] = useState(isTouch)

  const camera = useCamera(mirrorOn || previewOpen)
  const { idle, hideNow } = useIdle(3500, previewOpen || dockHover)
  const wake = useWakeLock()
  const fs = useFullscreen()

  const setLook = useCallback((patch: Partial<Look>) => setLookState((l) => ({ ...l, ...patch })), [setLookState])

  /** ← / → steps through tones or glows, whichever is active. */
  const step = useCallback(
    (dir: 1 | -1) => {
      setLookState((l) => {
        if (l.source === 'scene') {
          const i = SCENES.findIndex((s) => s.id === l.sceneId)
          return { ...l, sceneId: SCENES[(i + dir + SCENES.length) % SCENES.length].id }
        }
        const i = TONES.findIndex((t) => t.kelvin === l.kelvin && t.blush === l.blush)
        const next = TONES[(i === -1 ? 0 : i + dir + TONES.length) % TONES.length]
        return { ...l, kelvin: next.kelvin, blush: next.blush }
      })
    },
    [setLookState],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || previewOpen) return
      const t = e.target as HTMLElement
      if (t.tagName === 'INPUT' && (e.key.startsWith('Arrow') || e.key === ' ')) return
      if (t.getAttribute('role') === 'radio' && e.key.startsWith('Arrow')) return
      switch (e.key.toLowerCase()) {
        case 'f':
          fs.toggle()
          break
        case 'h':
          hideNow()
          break
        case 'm':
          setMinimised((m) => !m)
          break
        case 'c':
          setMirrorOn((m) => !m)
          break
        case 'p':
          setPreviewOpen(true)
          break
        case 'arrowright':
          step(1)
          break
        case 'arrowleft':
          step(-1)
          break
        case 'arrowup':
          e.preventDefault()
          setLookState((l) => ({ ...l, brightness: Math.min(100, l.brightness + 5) }))
          break
        case 'arrowdown':
          e.preventDefault()
          setLookState((l) => ({ ...l, brightness: Math.max(30, l.brightness - 5) }))
          break
        default:
          return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fs, hideNow, previewOpen, step, setLookState, setMinimised])

  const save = (_e: MouseEvent<HTMLButtonElement>) => {
    if (presets.length >= MAX_PRESETS) return
    setPresets((ps) => [{ id: crypto.randomUUID(), look }, ...ps])
    setCheer((c) => c + 1)
    setTab('saved')
  }

  return (
    <div className="app" data-ui={idle ? 'hidden' : 'shown'}>
      <LightStage look={look} />

      <header className="topbar">
        <div className="brand chrome">
          <Sunny size={30} cheer={cheer} />
          <span className="brand__word">Glowy</span>
          {wake.active && (
            <span className="awake mono" title="Your screen won’t sleep while Glowy is open">
              <span className="awake__dot" aria-hidden="true" />
              awake
            </span>
          )}
        </div>

        <nav className="tools chrome" aria-label="Tools">
          <IconButton label="Camera mirror" shortcut="C" pressed={mirrorOn} onClick={() => setMirrorOn((m) => !m)}>
            <Camera size={18} aria-hidden />
          </IconButton>
          <IconButton label="Meeting preview" shortcut="P" onClick={() => setPreviewOpen(true)}>
            <Video size={18} aria-hidden />
          </IconButton>
          {fs.supported && (
            <IconButton label={fs.on ? 'Exit full screen' : 'Full screen'} shortcut="F" onClick={fs.toggle}>
              {fs.on ? <Minimize size={18} aria-hidden /> : <Maximize size={18} aria-hidden />}
            </IconButton>
          )}
          <IconButton label="Hide controls" shortcut="H" onClick={hideNow}>
            <EyeOff size={18} aria-hidden />
          </IconButton>
        </nav>
      </header>

      {!tipSeen && (
        <aside className="tip chrome" role="note">
          <p>
            <strong>Turn your screen brightness all the way up.</strong> Glowy can only be as bright as your display.
          </p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setTipSeen(true)}>
            Got it
          </button>
        </aside>
      )}

      <div
        className="dock-wrap"
        data-min={minimised}
        onPointerEnter={() => !touch && setDockHover(true)}
        onPointerLeave={() => setDockHover(false)}
        onFocusCapture={() => setDockHover(true)}
        onBlurCapture={() => setDockHover(false)}
      >
        <Dock
          look={look}
          setLook={setLook}
          tab={tab}
          onTab={setTab}
          presets={presets}
          onSave={save}
          onApply={(pr) => {
            setLookState(pr.look)
          }}
          onDelete={(id) => setPresets((ps) => ps.filter((x) => x.id !== id))}
          onPreview={() => setPreviewOpen(true)}
          minimised={minimised}
          onMinimise={setMinimised}
        />
      </div>

      {mirrorOn && (
        <Mirror camera={camera} onClose={() => setMirrorOn(false)} onExpand={() => setPreviewOpen(true)} />
      )}

      <MeetingPreview open={previewOpen} onClose={() => setPreviewOpen(false)} camera={camera} look={look} />
    </div>
  )
}
