import { useEffect, useRef, useState } from 'react'
import { Download, Upload, X } from 'lucide-react'
import {
  MAX_FREEZES,
  exportDatabaseJson,
  getLocalDateString,
  importDatabaseJson,
  type UserStats,
} from '../db/dexie'
import { ONBOARDED_KEY } from './OnboardingFlow'

interface StatsBackupModalProps {
  stats: UserStats | null
  onClose: () => void
  /** Dipanggil setelah impor berhasil agar layar memuat ulang datanya. */
  onImported: () => void
}

interface Feedback {
  kind: 'success' | 'error'
  text: string
}

export function StatsBackupModal({ stats, onClose, onImported }: StatsBackupModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  async function handleExport() {
    setBusy(true)
    setFeedback(null)
    try {
      const json = await exportDatabaseJson()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `dzikir-backup-${getLocalDateString()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setFeedback({ kind: 'success', text: 'Cadangan berhasil diunduh.' })
    } catch {
      setFeedback({ kind: 'error', text: 'Gagal membuat cadangan. Coba lagi.' })
    } finally {
      setBusy(false)
    }
  }

  async function handleFileChosen(file: File | undefined) {
    if (!file) return
    const confirmed = window.confirm(
      'Impor akan MENGGANTI seluruh data dzikir di perangkat ini dengan isi cadangan. Lanjutkan?',
    )
    if (!confirmed) return

    setBusy(true)
    setFeedback(null)
    try {
      await importDatabaseJson(await file.text())
      try {
        localStorage.setItem(ONBOARDED_KEY, 'true')
      } catch {
        // Tidak kritis.
      }
      setFeedback({ kind: 'success', text: 'Cadangan berhasil dipulihkan.' })
      onImported()
    } catch (error) {
      setFeedback({
        kind: 'error',
        text: error instanceof Error ? error.message : 'Gagal memulihkan cadangan.',
      })
    } finally {
      setBusy(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const summary: { label: string; value: string }[] = [
    { label: 'Total Dzikir', value: String(stats?.totalAllTime ?? 0) },
    { label: 'Streak Saat Ini', value: `${stats?.currentStreak ?? 0} hari` },
    { label: 'Streak Terpanjang', value: `${stats?.longestStreak ?? 0} hari` },
    {
      label: 'Streak Freeze',
      value: `${stats?.freezesAvailable ?? 0} / ${MAX_FREEZES}`,
    },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#14231e]/60 sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="stats-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl border border-slate-800 bg-slate-900 p-5 pb-8 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="stats-title" className="text-lg font-bold">
            Statistik &amp; Cadangan
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {summary.map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-slate-800 p-4">
              <p className="text-xs text-slate-400">{label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-emerald-300">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleExport}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-4 py-3 font-bold text-slate-950 transition-all active:translate-y-1 active:border-b-0 disabled:opacity-60"
          >
            <Download className="h-5 w-5" aria-hidden="true" />
            Ekspor Cadangan (.json)
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-slate-700 bg-slate-800 px-4 py-3 font-bold text-slate-100 transition-all active:translate-y-0.5 active:border-b-2 disabled:opacity-60"
          >
            <Upload className="h-5 w-5" aria-hidden="true" />
            Impor Cadangan (.json)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(event) => void handleFileChosen(event.target.files?.[0])}
          />
        </div>

        {feedback && (
          <p
            role={feedback.kind === 'error' ? 'alert' : 'status'}
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${
              feedback.kind === 'error'
                ? 'bg-rose-500/15 text-rose-200'
                : 'bg-emerald-500/15 text-emerald-300'
            }`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  )
}
