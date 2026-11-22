import { useEffect, useState } from 'react'
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from '@rive-app/react-canvas'

export type MascotMood =
  | 'idle'
  | 'focus'
  | 'encourage'
  | 'celebrate'
  | 'milestone'
  | 'freeze'

type Pose = 'idle' | 'focus' | 'encourage' | 'celebrate'

interface MascotStageProps {
  mood: MascotMood
  message: string
  /** `row`: maskot di samping gelembung. `stack`: maskot di atas gelembung. */
  layout?: 'row' | 'stack'
}

const BASE = import.meta.env.BASE_URL

const POSE_VALUE: Record<Pose, number> = {
  idle: 0,
  focus: 1,
  encourage: 2,
  celebrate: 3,
}

const BUBBLE_BORDER: Record<Pose, string> = {
  idle: 'border-slate-700',
  focus: 'border-emerald-500/60',
  encourage: 'border-sky-400/70',
  celebrate: 'border-amber-400/70',
}

function normalizePose(mood: MascotMood): Pose {
  if (mood === 'milestone') return 'celebrate'
  if (mood === 'freeze') return 'encourage'
  return mood
}

/** Sub-komponen yang memuat hudi.riv via useRive.
 *  Dikembalikan undefined jika Rive belum siap; parent akan menampilkan fallback PNG/SVG. */
function HudiRive({ pose, size }: { pose: Pose; size: 'sm' | 'lg' }) {
  const { rive, RiveComponent } = useRive({
    src: `${BASE}mascot/hudi.riv`,
    artboard: 'HudiArtboard',
    stateMachines: 'HudiStateMachine',
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    autoplay: true,
  })

  const poseInput = useStateMachineInput(rive, 'HudiStateMachine', 'pose')

  useEffect(() => {
    if (poseInput) {
      poseInput.value = POSE_VALUE[pose]
    }
  }, [poseInput, pose])

  const dim = size === 'lg' ? 'h-44 w-44' : 'h-28 w-28'
  return <RiveComponent className={`${dim} aspect-square`} />
}

export function MascotStage({ mood, message, layout = 'row' }: MascotStageProps) {
  const pose = normalizePose(mood)
  const stacked = layout === 'stack'
  const size = stacked ? 'lg' : 'sm'

  // Fallback PNG path (usado si Rive falla o no existe el .riv)
  const pngSrc = `${BASE}mascot/hudi-${pose}.png`
  const [riveFailed, setRiveFailed] = useState(false)
  const [pngFailed, setPngFailed] = useState(false)

  // Resetea el estado de fallo cuando cambia el pose
  useEffect(() => { setPngFailed(false) }, [pose])

  return (
    <div
      className={
        stacked
          ? 'flex flex-col items-center gap-3'
          : 'flex items-end gap-3'
      }
    >
      <div
        className={`shrink-0 ${stacked ? 'h-44 w-44' : 'h-28 w-28'} aspect-square transition-transform duration-300 ${
          pose === 'celebrate' ? 'motion-safe:animate-bounce' : ''
        }`}
      >
        {/* Nivel 1: Rive animation (.riv) */}
        {!riveFailed && (
          <RiveMascot
            pose={pose}
            size={size}
            onError={() => setRiveFailed(true)}
          />
        )}

        {/* Nivel 2: PNG fallback */}
        {riveFailed && !pngFailed && (
          <img
            src={pngSrc}
            alt={`Hudi pose ${pose}`}
            draggable={false}
            className="h-full w-full select-none object-contain drop-shadow-md"
            onError={() => setPngFailed(true)}
          />
        )}

        {/* Nivel 3: SVG inline fallback */}
        {riveFailed && pngFailed && <HoopoeSvg pose={pose} />}
      </div>

      <div
        aria-live="polite"
        className={`relative rounded-2xl border bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-100 ${BUBBLE_BORDER[pose]} ${
          stacked ? 'text-center' : 'mb-3 flex-1'
        }`}
      >
        <span
          aria-hidden="true"
          className={`absolute h-3 w-3 rotate-45 border-slate-700 bg-slate-800 ${
            stacked
              ? '-top-1.5 left-1/2 -translate-x-1/2 border-l border-t'
              : '-left-1.5 bottom-4 border-b border-l'
          }`}
        />
        {message}
      </div>
    </div>
  )
}

/** Wrapper yang menangkap error pemuatan Rive dan melaporkannya ke parent. */
function RiveMascot({
  pose,
  size,
  onError,
}: {
  pose: Pose
  size: 'sm' | 'lg'
  onError: () => void
}) {
  const { rive, RiveComponent } = useRive({
    src: `${BASE}mascot/hudi.riv`,
    artboard: 'HudiArtboard',
    stateMachines: 'HudiStateMachine',
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    autoplay: true,
    onLoadError: onError,
  })

  const poseInput = useStateMachineInput(rive, 'HudiStateMachine', 'pose')

  useEffect(() => {
    if (poseInput) poseInput.value = POSE_VALUE[pose]
  }, [poseInput, pose])

  const dim = size === 'lg' ? 'h-44 w-44' : 'h-28 w-28'
  return <RiveComponent className={`${dim} aspect-square object-contain`} />
}

/** Ilustrasi vektor Hud-hud bawaan (fallback SVG bila semua aset eksternal gagal) */
function HoopoeSvg({ pose }: { pose: Pose }) {
  const happy = pose === 'celebrate'

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Maskot Hud-hud"
      className="h-full w-full object-contain"
    >
      {/* Jambul */}
      <path d="M46 34 L40 10 L52 28 Z" fill="#F3CFA0" />
      <path d="M54 30 L52 6 L62 28 Z" fill="#F3CFA0" />
      <path d="M64 30 L68 8 L72 32 Z" fill="#F3CFA0" />
      <path d="M72 36 L84 16 L80 40 Z" fill="#F3CFA0" />
      <circle cx="40" cy="10" r="3" fill="#14231E" />
      <circle cx="52" cy="6" r="3" fill="#14231E" />
      <circle cx="68" cy="8" r="3" fill="#14231E" />
      <circle cx="84" cy="16" r="3" fill="#14231E" />

      {/* Ekor */}
      <path d="M82 96 L108 106 L100 84 Z" fill="#1F6B4F" />
      <path d="M92 96 L100 99" stroke="#F3CFA0" strokeWidth="3" strokeLinecap="round" />

      {/* Badan */}
      <ellipse cx="58" cy="82" rx="30" ry="26" fill="#2E8B67" />
      <ellipse cx="52" cy="88" rx="18" ry="16" fill="#88D4B4" />

      {/* Sayap */}
      <g transform={happy ? 'rotate(-28 74 70)' : undefined}>
        <ellipse cx="72" cy="80" rx="14" ry="20" fill="#1F6B4F" />
        <path d="M60 74h24M60 82h24M62 90h20" stroke="#F3CFA0" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Kepala */}
      <circle cx="58" cy="52" r="22" fill="#2E8B67" />
      <circle cx="46" cy="58" r="4" fill="#E2847A" opacity="0.45" />

      {/* Paruh */}
      <path d="M36 52 Q14 54 8 66 Q26 62 38 58 Z" fill="#2D3748" />

      {/* Mata */}
      {happy ? (
        <path d="M43 49 Q48 42 53 49" stroke="#14231E" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <circle cx="48" cy="48" r="5.5" fill="#FFFFFF" />
          <circle cx="47.5" cy="48.5" r="3" fill="#14231E" />
        </>
      )}

      {pose === 'focus' && (
        <path d="M42 41 L54 44" stroke="#14231E" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {pose === 'encourage' && (
        <path d="M42 44 L54 41" stroke="#14231E" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {happy && (
        <>
          <path d="M100 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#F3CFA0" />
          <path d="M16 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#F3CFA0" />
        </>
      )}
      {pose === 'encourage' && (
        <g>
          <path d="M98 20 l14 5 v10 c0 9 -6 15 -14 18 c-8 -3 -14 -9 -14 -18 v-10z" fill="#38BDF8" />
          <path d="M92 36 l5 5 9 -10" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
    </svg>
  )
}
