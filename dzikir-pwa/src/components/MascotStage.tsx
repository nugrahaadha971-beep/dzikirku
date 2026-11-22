import { useState } from 'react'

export type MascotMood =
  | 'idle'
  | 'focus'
  | 'encourage'
  | 'celebrate'
  | 'milestone'
  | 'freeze'

interface MascotStageProps {
  mood: MascotMood
  message: string
  /** `row`: maskot di samping gelembung. `stack`: maskot di atas gelembung. */
  layout?: 'row' | 'stack'
}

const BASE = import.meta.env.BASE_URL

// Normalisasi pose ke 4 pose utama
function normalizePose(mood: MascotMood): 'idle' | 'focus' | 'encourage' | 'celebrate' {
  if (mood === 'milestone') return 'celebrate'
  if (mood === 'freeze') return 'encourage'
  return mood
}

const POSES: Record<'idle' | 'focus' | 'encourage' | 'celebrate', string> = {
  idle: `${BASE}mascot/hudi-idle.png`,
  focus: `${BASE}mascot/hudi-focus.png`,
  encourage: `${BASE}mascot/hudi-encourage.png`,
  celebrate: `${BASE}mascot/hudi-celebrate.png`,
}

const BUBBLE_BORDER: Record<'idle' | 'focus' | 'encourage' | 'celebrate', string> = {
  idle: 'border-slate-700',
  focus: 'border-emerald-500/60',
  encourage: 'border-sky-400/70',
  celebrate: 'border-amber-400/70',
}

export function MascotStage({ mood, message, layout = 'row' }: MascotStageProps) {
  const pose = normalizePose(mood)
  const src = POSES[pose]
  const [failedSrcs, setFailedSrcs] = useState<ReadonlySet<string>>(() => new Set())
  const useFallback = failedSrcs.has(src)
  const stacked = layout === 'stack'

  return (
    <div
      className={
        stacked
          ? 'flex flex-col items-center gap-3'
          : 'flex items-end gap-3'
      }
    >
      <div
        className={`shrink-0 ${stacked ? 'h-44 w-44' : 'h-28 w-28'} transition-transform duration-300 ${
          pose === 'celebrate' ? 'motion-safe:animate-bounce' : ''
        }`}
      >
        {useFallback ? (
          <HoopoeSvg pose={pose} />
        ) : (
          <img
            src={src}
            alt={`Hudi pose ${pose}`}
            draggable={false}
            className="h-full w-full select-none object-contain drop-shadow-md"
            onError={() => setFailedSrcs((prev) => new Set(prev).add(src))}
          />
        )}
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

/** Ilustrasi vektor Hud-hud bawaan (fallback SVG bila berkas gambar belum termuat) */
function HoopoeSvg({ pose }: { pose: 'idle' | 'focus' | 'encourage' | 'celebrate' }) {
  const happy = pose === 'celebrate'

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Maskot Hud-hud"
      className="h-full w-full"
    >
      {/* Jambul burung hud-hud */}
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
        <path
          d="M60 74h24M60 82h24M62 90h20"
          stroke="#F3CFA0"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* Kepala */}
      <circle cx="58" cy="52" r="22" fill="#2E8B67" />
      <circle cx="46" cy="58" r="4" fill="#E2847A" opacity="0.45" />

      {/* Paruh */}
      <path d="M36 52 Q14 54 8 66 Q26 62 38 58 Z" fill="#2D3748" />

      {/* Mata */}
      {happy ? (
        <path
          d="M43 49 Q48 42 53 49"
          stroke="#14231E"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
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
          <path
            d="M98 20 l14 5 v10 c0 9 -6 15 -14 18 c-8 -3 -14 -9 -14 -18 v-10z"
            fill="#38BDF8"
          />
          <path
            d="M92 36 l5 5 9 -10"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>
      )}
    </svg>
  )
}
