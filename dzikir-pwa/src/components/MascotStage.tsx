import { useState } from 'react'

export type MascotMood = 'idle' | 'focus' | 'milestone' | 'freeze'

interface MascotStageProps {
  mood: MascotMood
  message: string
  /** `row`: maskot di kiri, gelembung di kanan. `stack`: maskot besar di tengah. */
  layout?: 'row' | 'stack'
}

const BASE = import.meta.env.BASE_URL

const POSES: Record<MascotMood, string> = {
  idle: `${BASE}mascot/hudi-idle.png`,
  focus: `${BASE}mascot/hudi-focus.png`,
  milestone: `${BASE}mascot/hudi-celebrate.png`,
  freeze: `${BASE}mascot/hudi-encourage.png`,
}

const BUBBLE_BORDER: Record<MascotMood, string> = {
  idle: 'border-slate-700',
  focus: 'border-emerald-500/60',
  milestone: 'border-amber-400/70',
  freeze: 'border-sky-400/70',
}

export function MascotStage({ mood, message, layout = 'row' }: MascotStageProps) {
  const src = POSES[mood]
  // PNG maskot belum tentu sudah disalin ke public/mascot/ : pakai SVG cadangan.
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
        className={`shrink-0 ${stacked ? 'h-48 w-48' : 'h-28 w-28'} ${
          mood === 'milestone' ? 'motion-safe:animate-bounce' : ''
        }`}
      >
        {useFallback ? (
          <HoopoeSvg mood={mood} />
        ) : (
          <img
            src={src}
            alt="Hudi, maskot burung hud-hud"
            draggable={false}
            className="h-full w-full select-none object-contain drop-shadow-lg"
            onError={() => setFailedSrcs((prev) => new Set(prev).add(src))}
          />
        )}
      </div>

      <div
        aria-live="polite"
        className={`relative rounded-2xl border bg-slate-800 px-4 py-3 text-sm leading-relaxed text-slate-100 ${BUBBLE_BORDER[mood]} ${
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

/** Avatar hud-hud bergaya (zamrud & emas) sebagai cadangan bila PNG belum ada. */
function HoopoeSvg({ mood }: { mood: MascotMood }) {
  const happy = mood === 'milestone'

  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Hudi, maskot burung hud-hud"
      className="h-full w-full"
    >
      {/* jambul */}
      <path d="M46 34 L40 10 L52 28 Z" fill="#fbbf24" />
      <path d="M54 30 L52 6 L62 28 Z" fill="#fbbf24" />
      <path d="M64 30 L68 8 L72 32 Z" fill="#fbbf24" />
      <path d="M72 36 L84 16 L80 40 Z" fill="#fbbf24" />
      <circle cx="40" cy="10" r="3" fill="#0f172a" />
      <circle cx="52" cy="6" r="3" fill="#0f172a" />
      <circle cx="68" cy="8" r="3" fill="#0f172a" />
      <circle cx="84" cy="16" r="3" fill="#0f172a" />

      {/* ekor */}
      <path d="M82 96 L108 106 L100 84 Z" fill="#047857" />
      <path d="M92 96 L100 99" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

      {/* badan */}
      <ellipse cx="58" cy="82" rx="30" ry="26" fill="#10b981" />
      <ellipse cx="52" cy="88" rx="18" ry="16" fill="#6ee7b7" />

      {/* sayap (terangkat saat perayaan) */}
      <g transform={happy ? 'rotate(-28 74 70)' : undefined}>
        <ellipse cx="72" cy="80" rx="14" ry="20" fill="#047857" />
        <path
          d="M60 74h24M60 82h24M62 90h20"
          stroke="#fbbf24"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>

      {/* kepala */}
      <circle cx="58" cy="52" r="22" fill="#10b981" />
      <circle cx="46" cy="58" r="4" fill="#fb7185" opacity="0.45" />

      {/* paruh */}
      <path d="M36 52 Q14 54 8 66 Q26 62 38 58 Z" fill="#334155" />

      {/* mata */}
      {happy ? (
        <path
          d="M43 49 Q48 42 53 49"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <circle cx="48" cy="48" r="5.5" fill="#ffffff" />
          <circle cx="47.5" cy="48.5" r="3" fill="#0f172a" />
        </>
      )}
      {mood === 'focus' && (
        <path d="M42 41 L54 44" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {mood === 'freeze' && (
        <path d="M42 44 L54 41" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      )}

      {/* dekorasi suasana */}
      {happy && (
        <>
          <path d="M100 22 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fbbf24" />
          <path d="M16 30 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fbbf24" />
        </>
      )}
      {mood === 'freeze' && (
        <g>
          <path
            d="M98 20 l14 5 v10 c0 9 -6 15 -14 18 c-8 -3 -14 -9 -14 -18 v-10z"
            fill="#38bdf8"
          />
          <path
            d="M92 36 l5 5 9 -10"
            stroke="#ffffff"
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
