import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Lock, RotateCcw, Undo2 } from 'lucide-react'
import { LEVEL_THRESHOLDS, getDzikirById, type MeaningLevel } from '../data/dzikirSeed'
import { getRoutine } from '../data/routines'
import { getOrInitStats, type RoutineRun, type UserStats } from '../db/dexie'
import {
  getItemTarget,
  getRoutineProgress,
  getTodayRuns,
  recordRoutineTap,
  resetRoutineItem,
  restartRoutine,
  undoRoutineTap,
} from '../db/routines'
import { useHaptics } from '../hooks/useHaptics'
import { MascotStage } from './MascotStage'
import { PRIMARY_BUTTON } from './buttonStyles'

interface PlayerViewProps {
  routineId: string
  onExit: () => void
}

const LEVELS: { level: MeaningLevel; label: string; key: 'level1' | 'level2' | 'level3' }[] = [
  { level: 1, label: 'Makna', key: 'level1' },
  { level: 2, label: 'Keutamaan', key: 'level2' },
  { level: 3, label: 'Refleksi', key: 'level3' },
]

const RING_LENGTH = 2 * Math.PI * 76

export function PlayerView({ routineId, onExit }: PlayerViewProps) {
  const routine = getRoutine(routineId)
  const haptics = useHaptics()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [run, setRun] = useState<RoutineRun | null>(null)
  const [index, setIndex] = useState(0)
  const [level, setLevel] = useState<MeaningLevel>(1)
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [finished, setFinished] = useState(false)
  const queue = useRef<Promise<void>>(Promise.resolve())

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [loadedStats, runs] = await Promise.all([getOrInitStats(), getTodayRuns()])
        let current: RoutineRun | null = runs[routine.id] ?? null
        const progress = getRoutineProgress(routine, current, loadedStats)
        if (progress.done) current = await restartRoutine(routine.id)
        if (cancelled) return
        setStats(loadedStats)
        setRun(current)
        setIndex(progress.done ? 0 : progress.firstOpen)
      } catch {
        if (!cancelled) setError('Penyimpanan lokal tidak tersedia di peramban ini. Coba tutup mode privat.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [routine])

  useEffect(() => {
    if (!confirmReset) return
    const timer = window.setTimeout(() => setConfirmReset(false), 3000)
    return () => window.clearTimeout(timer)
  }, [confirmReset])

  function enqueue(task: () => Promise<void>) {
    queue.current = queue.current.then(task).catch(() => {
      setError('Gagal menyimpan hitungan. Coba lagi.')
    })
  }

  if (!stats) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-slate-950 p-4" aria-busy={!error}>
        {error && (
          <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}
        <button type="button" onClick={onExit} className="mt-4 text-sm font-semibold text-slate-300 underline">
          Kembali
        </button>
      </div>
    )
  }

  const item = getDzikirById(routine.items[index])
  const target = getItemTarget(stats, item.id)
  const count = run?.counts[index] ?? 0
  const isDone = count >= target
  const isLast = index === routine.items.length - 1
  const lifetime = stats.lifetimeByDzikir[item.id] ?? 0
  const activeLevel = LEVELS.find((entry) => entry.level === level) ?? LEVELS[0]
  const unlocked = lifetime >= LEVEL_THRESHOLDS[activeLevel.level]

  const message =
    flash ??
    (isDone
      ? 'Alhamdulillah, bacaan ini selesai!'
      : count === 0
        ? 'Tarik napas, fokus, lalu mulai pelan-pelan.'
        : count >= target * 0.7
          ? 'Hampir selesai, istiqomah!'
          : 'Bagus, teruskan dengan tenang.')

  function handleTap() {
    if (isDone) return
    enqueue(async () => {
      setFlash(null)
      const result = await recordRoutineTap(routine.id, index, target)
      if (!result) return
      setStats(result.stats)
      setRun(result.run)
      const next = result.run.counts[index] ?? 0
      if (result.newlyUnlockedLevel !== null) {
        haptics.triggerMilestone()
        setFlash(`Makna level ${result.newlyUnlockedLevel} terbuka!`)
      } else if (next >= target || next % 33 === 0) {
        haptics.triggerMilestone()
      } else {
        haptics.triggerTap()
      }
    })
  }

  function handleUndo() {
    enqueue(async () => {
      setFlash(null)
      const result = await undoRoutineTap(routine.id, index)
      if (!result) return
      setStats(result.stats)
      setRun(result.run)
    })
  }

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    setConfirmReset(false)
    enqueue(async () => {
      setFlash(null)
      const result = await resetRoutineItem(routine.id, index)
      if (!result) return
      setStats(result.stats)
      setRun(result.run)
    })
  }

  function handleNext() {
    if (isLast) {
      setFinished(true)
      return
    }
    setIndex(index + 1)
    setLevel(1)
    setFlash(null)
  }

  const sideButton =
    'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all active:scale-95'
  const sideIdle = 'border-slate-700 bg-slate-800 text-slate-200'
  const sideConfirm = 'border-rose-400 bg-rose-500/20 text-rose-200'

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center px-3 pt-3">
        <button
          type="button"
          aria-label="Kembali"
          onClick={onExit}
          className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="flex-1 pr-10 text-center text-lg font-bold">{routine.title}</h1>
      </header>

      <div
        role="progressbar"
        aria-label="Progres bacaan"
        aria-valuemin={0}
        aria-valuemax={routine.items.length}
        aria-valuenow={index}
        className="mx-4 mt-3 flex gap-1.5"
      >
        {routine.items.map((dzikirId, position) => {
          const finishedItem = (run?.counts[position] ?? 0) >= getItemTarget(stats, dzikirId)
          return (
            <span
              key={`${dzikirId}-${position}`}
              className={`h-2.5 flex-1 rounded-full ${
                finishedItem ? 'bg-emerald-500' : position === index ? 'bg-emerald-300' : 'bg-slate-800'
              }`}
            />
          )
        })}
      </div>

      <section className="flex flex-col gap-4 px-4 pb-4 pt-4">
        {error && (
          <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        )}

        <article className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="max-h-[30vh] overflow-y-auto overscroll-contain">
            <p
              dir="rtl"
              lang="ar"
              className={`text-center font-arabic leading-relaxed text-slate-100 ${item.arabic.length > 200 ? 'text-2xl' : 'text-3xl'}`}
            >
              {item.arabic}
            </p>
          </div>
          <p className="mt-1 text-center text-base italic text-emerald-300">{item.transliteration}</p>
          <p className="mt-1 text-center text-sm text-slate-300">{item.translation}</p>

          <div className="mt-4 rounded-2xl bg-slate-800/70 p-4">
            <div role="tablist" aria-label="Makna dan keutamaan" className="flex gap-2">
              {LEVELS.map((entry) => {
                const locked = lifetime < LEVEL_THRESHOLDS[entry.level]
                return (
                  <button
                    key={entry.level}
                    type="button"
                    role="tab"
                    aria-selected={level === entry.level}
                    onClick={() => setLevel(entry.level)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      level === entry.level
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                    {entry.label}
                  </button>
                )
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {unlocked
                ? item.meanings[activeLevel.key]
                : `Terbuka di ${LEVEL_THRESHOLDS[activeLevel.level]} hitungan seumur hidup (kini ${lifetime}).`}
            </p>
            <p className="mt-2 text-xs text-slate-400">Sumber: {item.sourceRef}</p>
          </div>
        </article>

        <div className="flex items-center justify-center gap-5">
          <div className="flex w-14 flex-col items-center gap-1">
            <button type="button" aria-label="Kurangi satu" onClick={handleUndo} className={`${sideButton} ${sideIdle}`}>
              <Undo2 className="h-5 w-5" />
            </button>
            <span className="text-xs text-slate-400">-1</span>
          </div>

          <button
            type="button"
            aria-label={`Tekan untuk menghitung, ${count} dari ${target}`}
            onClick={handleTap}
            disabled={isDone}
            className="group relative h-[170px] w-[170px] shrink-0 touch-manipulation select-none rounded-full"
          >
            <svg viewBox="0 0 170 170" aria-hidden="true" className="absolute inset-0 h-full w-full -rotate-90">
              <circle cx="85" cy="85" r="76" fill="none" strokeWidth="10" className="stroke-slate-800" />
              <circle
                cx="85"
                cy="85"
                r="76"
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                className="stroke-emerald-500 transition-[stroke-dashoffset] duration-200"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH * (1 - Math.min(count / target, 1))}
              />
            </svg>
            <span className="absolute left-[19px] top-[19px] flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full border-b-4 border-emerald-700 bg-emerald-500 text-white transition-all group-active:translate-y-1 group-active:border-b-0">
              <span className="text-4xl font-extrabold leading-none tabular-nums">{count}</span>
              <span className="mt-1 text-sm font-semibold tabular-nums opacity-70">/ {target}</span>
            </span>
          </button>

          <div className="flex w-14 flex-col items-center gap-1">
            <button
              type="button"
              aria-label={confirmReset ? 'Tekan lagi untuk mengulang dari nol' : 'Ulangi dari nol'}
              onClick={handleReset}
              className={`${sideButton} ${confirmReset ? sideConfirm : sideIdle}`}
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <span className={`text-xs ${confirmReset ? 'text-rose-300' : 'text-slate-400'}`}>
              {confirmReset ? 'Yakin?' : 'Reset'}
            </span>
          </div>
        </div>

        <MascotStage mood={isDone ? 'milestone' : 'focus'} message={message} />
      </section>

      <div className="sticky bottom-0 z-10 mt-auto bg-linear-to-t from-slate-950 via-slate-950 to-slate-950/0 px-4 pb-4 pt-6">
        <button type="button" className={PRIMARY_BUTTON} onClick={isDone ? handleNext : handleTap}>
          {isDone ? (isLast ? 'SELESAI' : 'LANJUT') : 'TEKAN'}
        </button>
      </div>

      {finished && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sesi selesai"
          className="fixed inset-0 z-30 flex items-center justify-center bg-[#14231e]/60 p-6"
        >
          <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-white p-6">
            <MascotStage
              layout="stack"
              mood="milestone"
              message={`Alhamdulillah! ${routine.title} selesai. Streak kamu ${stats.currentStreak} hari.`}
            />
            <button type="button" className={`${PRIMARY_BUTTON} mt-5`} onClick={onExit}>
              KEMBALI
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
