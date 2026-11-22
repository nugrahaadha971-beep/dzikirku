import { useEffect, useState } from 'react'
import { Check, Flame, Heart, Moon, Star, Sun, Target, type LucideIcon } from 'lucide-react'
import { ROUTINES, getNextSuggestion, getRoutineForNow, type Routine, type RoutineIcon } from '../data/routines'
import { getOrInitStats, type RoutineRun, type UserStats } from '../db/dexie'
import { getRoutineProgress, getTodayRuns } from '../db/routines'
import { useClock } from '../hooks/useClock'

interface HomeViewProps {
  onStartRoutine: (routineId: string) => void
  onFreeCount: () => void
}

const ICONS: Record<RoutineIcon, LucideIcon> = { sun: Sun, moon: Moon, star: Star, heart: Heart }

/** Posisi node pada jalur (x dalam %, y dalam px). */
const NODES = [
  { x: 70, y: 40 },
  { x: 30, y: 140 },
  { x: 70, y: 240 },
  { x: 30, y: 340 },
  { x: 70, y: 440 },
] as const

const PATH_D = 'M70 40C70 90 30 90 30 140C30 190 70 190 70 240C70 290 30 290 30 340C30 390 70 390 70 440'

export function HomeView({ onStartRoutine, onFreeCount }: HomeViewProps) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [runs, setRuns] = useState<Record<string, RoutineRun>>({})
  const [failed, setFailed] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const now = useClock()

  useEffect(() => {
    let cancelled = false
    Promise.all([getOrInitStats(), getTodayRuns()])
      .then(([loadedStats, loadedRuns]) => {
        if (cancelled) return
        setStats(loadedStats)
        setRuns(loadedRuns)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (failed) {
    return (
      <p role="alert" className="m-4 rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
        Penyimpanan lokal tidak tersedia di peramban ini. Coba tutup mode privat.
      </p>
    )
  }
  if (!stats) return <div className="min-h-[60vh]" aria-busy="true" />

  const progress = Object.fromEntries(
    ROUTINES.map((routine) => [routine.id, getRoutineProgress(routine, runs[routine.id], stats)]),
  )
  const doneCount = ROUTINES.filter((routine) => progress[routine.id].done).length
  const allDone = doneCount === ROUTINES.length
  const isDone = (routine: Routine) => progress[routine.id].done
  const suggested = getRoutineForNow(now)
  const next = getNextSuggestion(now)
  const fallback =
    [suggested, next.routine].find((routine) => !isDone(routine)) ??
    ROUTINES.find((routine) => !isDone(routine)) ??
    ROUTINES[0]
  const active: Routine = ROUTINES.find((routine) => routine.id === selected) ?? fallback
  const activeProgress = progress[active.id]
  const streakNote = stats.currentStreak > 0 ? ` Streak ${stats.currentStreak} hari, istiqomah ya!` : ''
  const nextTime = `${String(next.startHour).padStart(2, '0')}.00`
  const message = allDone
    ? 'Masya Allah, semua sesi hari ini selesai! Sampai jumpa besok.'
    : !isDone(suggested)
      ? `Sekarang waktunya ${suggested.title}. Yuk mulai dzikirnya.${streakNote}`
      : `${suggested.title} sudah selesai. Saran berikutnya: ${next.routine.title} pukul ${nextTime}.${streakNote}`

  return (
    <div className="px-4 pb-6 pt-2">
      <div className="flex items-center justify-between">
        <span
          aria-label={`Streak ${stats.currentStreak} hari`}
          className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-bold tabular-nums text-amber-300"
        >
          <Flame className="h-4 w-4" aria-hidden="true" />
          {stats.currentStreak}
          <span className="text-xs font-semibold">hari</span>
        </span>
        <button
          type="button"
          aria-label="Target harian"
          onClick={() => setHint(`Hari ini: ${doneCount}/${ROUTINES.length} sesi selesai`)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400/15 text-sky-300 hover:bg-sky-400/25"
        >
          <Target className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {hint && (
        <p role="status" className="mt-3 rounded-xl bg-slate-800 px-4 py-2 text-center text-sm font-semibold text-slate-200">
          {hint}
        </p>
      )}

      <section className="mt-4 rounded-3xl bg-[#1F6F78] p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            {active.id === suggested.id && !activeProgress.done && (
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-200">
                Disarankan sekarang
              </p>
            )}
            <h2 className="mb-3 text-lg font-extrabold leading-snug">
              {active.title} - Bacaan {activeProgress.current}/{activeProgress.total}
            </h2>
            <button
              type="button"
              onClick={() => onStartRoutine(active.id)}
              className="w-full rounded-2xl border-b-4 border-emerald-200 bg-white px-6 py-3 text-base font-bold tracking-wide text-emerald-700 transition-all active:translate-y-1 active:border-b-0"
            >
              {activeProgress.done ? 'ULANGI DZIKIR' : 'MULAI DZIKIR'}
            </button>
          </div>
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[#FBE7C6]">
            <img
              src={`${import.meta.env.BASE_URL}mascot/${allDone ? 'hudi-celebrate.png' : 'hudi-focus.png'}`}
              alt="Hudi, maskot burung hud-hud"
              draggable={false}
              className="h-28 w-auto select-none"
            />
          </div>
        </div>
      </section>

      <div className="relative my-2 h-[500px]">
        <svg
          viewBox="0 0 100 500"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        >
          <path
            d={PATH_D}
            fill="none"
            stroke="#9ED8C6"
            strokeWidth="7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {ROUTINES.map((routine, index) => {
          const { x, y } = NODES[index % NODES.length]
          const Icon = routine.id !== active.id && progress[routine.id].done ? Check : ICONS[routine.icon]
          const isActive = routine.id === active.id
          const isDone = progress[routine.id].done
          const tone = isActive
            ? 'bg-emerald-500 text-white shadow-[0_4px_0_#0F6E56]'
            : isDone
              ? 'bg-emerald-700 text-white shadow-[0_4px_0_#0a4a3a]'
              : 'bg-slate-700 text-slate-400 shadow-[0_4px_0_#b8cbc3]'
          const labelSide = x > 50 ? { right: `${100 - x + 10}%` } : { left: `${x + 10}%` }
          return (
            <div key={routine.id}>
              <button
                type="button"
                aria-label={routine.title}
                aria-pressed={isActive}
                onClick={() => {
                  setSelected(routine.id)
                  setHint(null)
                }}
                className={`absolute -ml-[30px] -mt-[30px] flex h-[60px] w-[60px] items-center justify-center rounded-full transition-all active:translate-y-1 active:shadow-none ${tone}`}
                style={{ left: `${x}%`, top: y }}
              >
                <Icon className="h-6 w-6" aria-hidden="true" />
              </button>
              <span
                className={`absolute w-[42%] -translate-y-1/2 text-[15px] font-bold ${
                  x > 50 ? 'text-right' : 'text-left'
                } ${isActive ? 'text-emerald-300' : 'text-slate-200'}`}
                style={{ top: y, ...labelSide }}
              >
                {routine.title}
              </span>
            </div>
          )
        })}
      </div>

      <p
        role="status"
        aria-live="polite"
        className="mt-5 rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-center text-sm leading-relaxed text-slate-100"
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onFreeCount}
        className="mt-5 w-full py-2 text-center text-sm font-semibold text-slate-400 underline underline-offset-4"
      >
        Tasbih bebas (tanpa sesi)
      </button>
    </div>
  )
}
