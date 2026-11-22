import { useEffect, useState } from 'react'
import { getOrInitStats, type UserStats } from '../db/dexie'
import { useHaptics } from '../hooks/useHaptics'
import { MascotStage } from './MascotStage'
import { StatsBackupModal } from './StatsBackupModal'

interface SettingsViewProps {
  dataVersion: number
  onDataImported: () => void
}

export function SettingsView({ dataVersion, onDataImported }: SettingsViewProps) {
  const haptics = useHaptics()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [showBackup, setShowBackup] = useState(false)

  useEffect(() => {
    let cancelled = false
    getOrInitStats()
      .then((loaded) => {
        if (!cancelled) setStats(loaded)
      })
      .catch(() => {
        // Tanpa database, angka tampil 0.
      })
    return () => {
      cancelled = true
    }
  }, [dataVersion])

  const rowClass = 'flex items-center justify-between gap-3 border-b border-slate-800 py-4'

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 className="mb-2 text-xl font-bold">Setelan</h1>

      <div className={rowClass}>
        <div>
          <p className="font-bold">Getar saat menekan</p>
          <p className="text-xs text-slate-400">Umpan balik haptik di ponsel</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!haptics.muted}
          aria-label="Getar saat menekan"
          onClick={haptics.toggleMuted}
          className={`relative h-8 w-[52px] shrink-0 rounded-full transition-colors ${
            haptics.muted ? 'bg-slate-700' : 'bg-emerald-500'
          }`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${
              haptics.muted ? 'left-1' : 'left-7'
            }`}
          />
        </button>
      </div>

      <div className={rowClass}>
        <div>
          <p className="font-bold">Total hitungan</p>
          <p className="text-xs text-slate-400">Seumur hidup, semua dzikir</p>
        </div>
        <span className="font-bold tabular-nums text-amber-300">{stats?.totalAllTime ?? 0}x</span>
      </div>

      <div className={rowClass}>
        <div>
          <p className="font-bold">Streak terpanjang</p>
          <p className="text-xs text-slate-400">Hari berturut-turut</p>
        </div>
        <span className="font-bold tabular-nums text-amber-300">{stats?.longestStreak ?? 0} hari</span>
      </div>

      <div className={rowClass}>
        <div>
          <p className="font-bold">Cadangkan &amp; pulihkan</p>
          <p className="text-xs text-slate-400">Data tersimpan di perangkat, tanpa akun</p>
        </div>
        <button
          type="button"
          onClick={() => setShowBackup(true)}
          className="rounded-full border border-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"
        >
          Buka
        </button>
      </div>

      <div className="mt-6">
        <MascotStage mood="focus" message="DzikirKu bekerja offline. Semua hitungan hanya ada di perangkatmu." />
      </div>

      {showBackup && (
        <StatsBackupModal
          stats={stats}
          onClose={() => setShowBackup(false)}
          onImported={() => {
            setShowBackup(false)
            onDataImported()
          }}
        />
      )}
    </div>
  )
}
