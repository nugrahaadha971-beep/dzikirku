import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Flame,
  Lock,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  Undo2,
  Vibrate,
  VibrateOff,
  X,
} from 'lucide-react'
import {
  DZIKIR_SEED,
  LEVEL_THRESHOLDS,
  getDzikirById,
  getUnlockedLevel,
  type MeaningLevel,
} from '../data/dzikirSeed'
import {
  getLocalDateString,
  getOrInitStats,
  getTodaySession,
  recordTap,
  resetSession,
  setCustomTarget,
  undoTap,
  type UserStats,
} from '../db/dexie'
import { useHaptics } from '../hooks/useHaptics'
import { MascotStage, type MascotMood } from './MascotStage'
import { StatsBackupModal } from './StatsBackupModal'

interface TasbihViewProps {
  dzikirId: string
  onSelectDzikir: (dzikirId: string) => void
  /** Naik setiap kali data dipulihkan dari cadangan, agar layar memuat ulang. */
  dataVersion: number
  onDataImported: () => void
}

interface Flash {
  mood: MascotMood
  message: string
}

const RING_RADIUS = 74
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

const FOCUS_MESSAGES = [
  'Pelan saja, rasakan tiap ucapannya.',
  'Bagus. Tarik napas, lanjutkan.',
  'Hudi menemanimu. Terus ya.',
  'Hati yang tenang, lisan yang basah dzikir.',
]

export function TasbihView({
  dzikirId,
  onSelectDzikir,
  dataVersion,
  onDataImported,
}: TasbihViewProps) {
  const item = getDzikirById(dzikirId)
  const haptics = useHaptics()

  const [stats, setStats] = useState<UserStats | null>(null)
  const [count, setCount] = useState(0)
  const [lifetime, setLifetime] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [saveError, setSaveError] = useState(false)
  const [flash, setFlash] = useState<Flash | null>(null)
  const [toastLevel, setToastLevel] = useState<2 | 3 | null>(null)
  const [meaningTab, setMeaningTab] = useState<MeaningLevel>(1)
  const [confirmReset, setConfirmReset] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)

  // Jumlah tulisan ke IndexedDB yang belum selesai (untuk tap beruntun yang cepat).
  const pendingRef = useRef(0)
  const flashTimer = useRef<number | undefined>(undefined)
  const toastTimer = useRef<number | undefined>(undefined)
  const resetTimer = useRef<number | undefined>(undefined)

  const target = stats?.customTargets[item.id] ?? item.defaultTarget
  const level = getUnlockedLevel(lifetime)
  const activeTab: MeaningLevel = meaningTab <= level ? meaningTab : level

  const showFlash = useCallback(
    (mood: MascotMood, message: string, durationMs = 4500) => {
      window.clearTimeout(flashTimer.current)
      setFlash({ mood, message })
      flashTimer.current = window.setTimeout(() => setFlash(null), durationMs)
    },
    [],
  )

  const showToast = useCallback((unlocked: 2 | 3) => {
    window.clearTimeout(toastTimer.current)
    setToastLevel(unlocked)
    toastTimer.current = window.setTimeout(() => setToastLevel(null), 8000)
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(flashTimer.current)
      window.clearTimeout(toastTimer.current)
      window.clearTimeout(resetTimer.current)
    },
    [],
  )

  // Memuat sesi hari ini + statistik; memuat ulang saat aplikasi kembali terlihat
  // (mis. tanggal berganti saat ponsel dikunci).
  useEffect(() => {
    let cancelled = false

    async function load(initial: boolean) {
      try {
        const [loadedStats, session] = await Promise.all([
          getOrInitStats(),
          getTodaySession(item.id),
        ])
        if (cancelled) return
        setStats(loadedStats)
        setCount(session?.count ?? 0)
        setLifetime(loadedStats.lifetimeByDzikir[item.id] ?? 0)
        setLoadError(false)
        if (initial && loadedStats.freezeUsedDate === getLocalDateString()) {
          showFlash(
            'freeze',
            'Satu freeze dipakai untuk menjaga streak-mu. Lanjutkan hari ini, ya!',
            6000,
          )
        }
      } catch {
        if (!cancelled) setLoadError(true)
      }
    }

    setCount(0)
    setLifetime(0)
    setMeaningTab(1)
    setConfirmReset(false)
    void load(true)

    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && pendingRef.current === 0) {
        void load(false)
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [item.id, dataVersion, showFlash])

  /**
   * Menjalankan tulisan database. UI sudah diperbarui secara optimistis; hasil
   * dari DB baru menimpa tampilan ketika tidak ada tulisan lain yang tertunda,
   * supaya angka tidak "loncat" saat mengetuk cepat.
   */
  async function runWrite<T>(
    operation: () => Promise<T>,
    onDone: (result: T, settled: boolean) => void,
  ) {
    pendingRef.current += 1
    let result: T
    try {
      result = await operation()
    } catch {
      pendingRef.current -= 1
      setSaveError(true)
      return
    }
    pendingRef.current -= 1
    setSaveError(false)
    onDone(result, pendingRef.current === 0)
  }

  function handleTap() {
    if (!stats) return

    const nextCount = count + 1
    setCount(nextCount)
    setLifetime(lifetime + 1)

    if (nextCount === target) {
      haptics.triggerMilestone()
      showFlash('milestone', `Alhamdulillah! Target ${target}x hari ini tercapai.`)
    } else if (nextCount % 33 === 0) {
      haptics.triggerMilestone()
      showFlash('milestone', `Masya Allah, ${nextCount}x. Terus, pelan saja.`)
    } else {
      haptics.triggerTap()
    }

    const today = getLocalDateString()
    void runWrite(
      () => recordTap(item.id, target),
      (result, settled) => {
        if (result.newlyUnlockedLevel) {
          const unlocked = result.newlyUnlockedLevel
          showToast(unlocked)
          setMeaningTab(unlocked)
          haptics.triggerMilestone()
          showFlash('milestone', `Makna Level ${unlocked} terbuka! Lihat kotak makna di atas.`, 6000)
        }
        if (result.stats.freezeUsedDate === today && stats.freezeUsedDate !== today) {
          showFlash(
            'freeze',
            'Satu freeze dipakai untuk menjaga streak-mu. Lanjutkan hari ini, ya!',
            6000,
          )
        }
        if (settled) {
          setStats(result.stats)
          setCount(result.session.count)
          setLifetime(result.stats.lifetimeByDzikir[item.id] ?? 0)
        }
      },
    )
  }

  function handleUndo() {
    if (count === 0) return
    setCount(count - 1)
    setLifetime(Math.max(0, lifetime - 1))
    haptics.triggerTap()

    void runWrite(
      () => undoTap(item.id),
      (result, settled) => {
        if (settled) {
          setStats(result.stats)
          setCount(result.session?.count ?? 0)
          setLifetime(result.stats.lifetimeByDzikir[item.id] ?? 0)
        }
      },
    )
  }

  function handleReset() {
    // Ketuk dua kali agar hitungan tidak hilang karena salah sentuh.
    if (!confirmReset) {
      setConfirmReset(true)
      window.clearTimeout(resetTimer.current)
      resetTimer.current = window.setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    window.clearTimeout(resetTimer.current)
    setConfirmReset(false)
    if (count === 0) return

    setCount(0)
    void runWrite(
      () => resetSession(item.id),
      (_result, settled) => {
        if (settled) setCount(0)
      },
    )
  }

  function handleSetTarget(newTarget: number) {
    void runWrite(
      () => setCustomTarget(item.id, newTarget),
      (updatedStats, settled) => {
        if (settled) setStats(updatedStats)
      },
    )
  }

  function handleCustomTargetPrompt() {
    const input = window.prompt(`Masukkan target hitungan untuk ${item.title}:`, String(target))
    if (!input) return
    const parsed = parseInt(input.trim(), 10)
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 10000) {
      handleSetTarget(parsed)
    }
  }

  const mood: MascotMood = flash?.mood ?? (count === 0 ? 'idle' : 'focus')
  const message =
    flash?.message ??
    (count === 0
      ? 'Siap? Satu tap, satu langkah tenang.'
      : FOCUS_MESSAGES[Math.floor(count / 11) % FOCUS_MESSAGES.length])

  const meanings = item.meanings
  const meaningText =
    activeTab === 1 ? meanings.level1 : activeTab === 2 ? meanings.level2 : meanings.level3

  const nextLevel: 2 | 3 | null = level === 1 ? 2 : level === 2 ? 3 : null
  const nextThreshold = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null
  const levelProgress = nextThreshold ? Math.min(lifetime / nextThreshold, 1) : 1

  const ratio = Math.min(count / target, 1)

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 7rem)' }}>
      {/* ---------------------------- Zona 1: header --------------------------- */}
      <header className="flex items-center justify-between gap-2 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            aria-label={`Streak ${stats?.currentStreak ?? 0} hari`}
            className="flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-bold tabular-nums text-amber-300"
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            {stats?.currentStreak ?? 0}
          </span>
          <span
            aria-label={`Streak freeze tersisa ${stats?.freezesAvailable ?? 0}`}
            className="flex items-center gap-1.5 rounded-full bg-sky-400/15 px-3 py-1.5 text-sm font-bold tabular-nums text-sky-300"
          >
            <Shield className="h-4 w-4" aria-hidden="true" />
            {stats?.freezesAvailable ?? 0}
          </span>
          <span className="rounded-full bg-emerald-500/15 px-3 py-1.5 text-sm font-bold text-emerald-300">
            Level {level}/3
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={haptics.toggleMuted}
            aria-pressed={haptics.muted}
            aria-label={haptics.muted ? 'Aktifkan getar' : 'Matikan getar'}
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
          >
            {haptics.muted ? (
              <VibrateOff className="h-5 w-5" />
            ) : (
              <Vibrate className="h-5 w-5" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setStatsOpen(true)}
            aria-label="Statistik & cadangan"
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
          >
            <Trophy className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* ------------------------- Zona 2: panggung tengah ------------------------ */}
      <section className="flex flex-col gap-4 px-4 pb-4 pt-3">
        <div role="tablist" aria-label="Pilih dzikir" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {DZIKIR_SEED.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={entry.id === item.id}
              onClick={() => onSelectDzikir(entry.id)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                entry.id === item.id
                  ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                  : 'border-slate-700 bg-slate-900 text-slate-300'
              }`}
            >
              {entry.title}
            </button>
          ))}
        </div>

        <MascotStage mood={mood} message={message} />

        {(loadError || saveError) && (
          <p role="alert" className="rounded-xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
            {loadError
              ? 'Penyimpanan lokal tidak dapat dibuka, hitungan belum bisa disimpan.'
              : 'Gagal menyimpan hitungan terakhir. Coba ketuk lagi.'}
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
          <p className="mt-2 text-center text-base italic text-emerald-300">
            {item.transliteration}
          </p>
          <p className="mt-1 text-center text-sm text-slate-300">{item.translation}</p>

          <div className="mt-4 rounded-2xl bg-slate-800/70 p-4">
            <div role="tablist" aria-label="Makna dan keutamaan" className="flex gap-2">
              {([1, 2, 3] as const).map((n) => {
                const locked = n > level
                const selected = activeTab === n
                return (
                  <button
                    key={n}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    disabled={locked}
                    onClick={() => setMeaningTab(n)}
                    className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                      selected
                        ? 'bg-emerald-500 text-slate-950'
                        : locked
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-slate-700 text-slate-200'
                    }`}
                  >
                    {locked && <Lock className="h-3 w-3" aria-hidden="true" />}
                    Level {n}
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-sm leading-relaxed text-slate-200">{meaningText}</p>
            {activeTab === 3 && (
              <p className="mt-2 text-xs text-slate-400">Sumber: {item.sourceRef}</p>
            )}

            <div className="mt-4">
              <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={nextThreshold ?? lifetime}
                aria-valuenow={nextThreshold ? Math.min(lifetime, nextThreshold) : lifetime}
                className="h-2 overflow-hidden rounded-full bg-slate-700"
              >
                <div
                  className="h-full rounded-full bg-sky-400 transition-all"
                  style={{ width: `${levelProgress * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs tabular-nums text-slate-400">
                {nextLevel && nextThreshold
                  ? `${lifetime} / ${nextThreshold}x untuk membuka Level ${nextLevel}`
                  : `${lifetime}x seumur hidup · semua makna terbuka`}
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* ------------------------- Zona 3: area jempol ------------------------- */}
      <section
        className="sticky z-10 mt-auto bg-linear-to-t from-slate-950 via-slate-950 to-slate-950/0 px-4 pb-4 pt-6"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        {toastLevel && (
          <div
            role="status"
            className="mb-3 flex items-center gap-3 rounded-2xl bg-amber-400 px-4 py-3 text-slate-100 shadow-lg"
          >
            <Sparkles className="h-5 w-5 shrink-0" aria-hidden="true" />
            <p className="flex-1 text-sm font-semibold">
              Level {toastLevel} terbuka:{' '}
              {toastLevel === 2 ? 'Manfaat & Keutamaan' : 'Refleksi Harian & Dalil'}
            </p>
            <button
              type="button"
              onClick={() => setToastLevel(null)}
              aria-label="Tutup pemberitahuan"
              className="rounded-full p-1 hover:bg-amber-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Pemilih Target: 33, 100, 333, atau Kustom */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {([33, 100, 333] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleSetTarget(t)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                target === t
                  ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                  : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {t}x
            </button>
          ))}
          <button
            type="button"
            onClick={handleCustomTargetPrompt}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
              ![33, 100, 333].includes(target)
                ? 'border border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {![33, 100, 333].includes(target) ? `${target}x` : 'Kustom'}
          </button>
        </div>

        <div className="flex items-center justify-center gap-6">
          <div className="flex w-14 flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={count === 0}
              aria-label="Batalkan satu hitungan"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-800 text-slate-200 transition-all active:scale-95 disabled:opacity-40"
            >
              <Undo2 className="h-5 w-5" />
            </button>
            <span className="text-xs text-slate-400">-1</span>
          </div>

          <div className="relative h-40 w-40 shrink-0">
            <svg
              viewBox="0 0 160 160"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full -rotate-90"
            >
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="6"
                className="stroke-slate-800"
              />
              <circle
                cx="80"
                cy="80"
                r={RING_RADIUS}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={RING_CIRCUMFERENCE * (1 - ratio)}
                className={`transition-[stroke-dashoffset] duration-200 ${
                  ratio >= 1 ? 'stroke-amber-400' : 'stroke-emerald-500'
                }`}
              />
            </svg>
            <button
              type="button"
              onClick={handleTap}
              disabled={!stats}
              aria-label={`Hitung ${item.title}, sekarang ${count} dari ${target}`}
              className="absolute left-4 top-4 flex h-32 w-32 touch-manipulation select-none flex-col items-center justify-center rounded-full border-b-4 border-emerald-700 bg-emerald-500 text-slate-950 transition-all active:translate-y-1 active:border-b-0 disabled:opacity-60"
            >
              <span className="text-4xl font-extrabold leading-none tabular-nums">{count}</span>
              <span className="mt-1 text-sm font-semibold tabular-nums opacity-70">
                / {target}
              </span>
            </button>
          </div>

          <div className="flex w-14 flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleReset}
              disabled={count === 0 && !confirmReset}
              aria-label={
                confirmReset
                  ? 'Ketuk lagi untuk mengosongkan hitungan hari ini'
                  : 'Reset hitungan hari ini'
              }
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all active:scale-95 disabled:opacity-40 ${
                confirmReset
                  ? 'border-rose-500 bg-rose-500/20 text-rose-300'
                  : 'border-slate-700 bg-slate-800 text-slate-200'
              }`}
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <span className={`text-xs ${confirmReset ? 'text-rose-300' : 'text-slate-400'}`}>
              {confirmReset ? 'Yakin?' : 'Reset'}
            </span>
          </div>
        </div>
      </section>

      {statsOpen && (
        <StatsBackupModal
          stats={stats}
          onClose={() => setStatsOpen(false)}
          onImported={onDataImported}
        />
      )}
    </div>
  )
}
