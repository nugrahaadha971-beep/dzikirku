import { useEffect, useState, type ReactNode } from 'react'
import { Lock } from 'lucide-react'
import {
  CATEGORY_LABELS,
  DZIKIR_SEED,
  LEVEL_THRESHOLDS,
  type DzikirCategory,
  type DzikirItem,
} from '../data/dzikirSeed'
import { getOrInitStats } from '../db/dexie'
import { PRIMARY_BUTTON } from './buttonStyles'

interface CatalogViewProps {
  onStartDzikir: (dzikirId: string) => void
}

type CategoryFilter = 'semua' | DzikirCategory

const FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  { value: 'sholat', label: CATEGORY_LABELS.sholat },
  { value: 'harian', label: CATEGORY_LABELS.harian },
  { value: 'ketenangan', label: CATEGORY_LABELS.ketenangan },
]

export function CatalogView({ onStartDzikir }: CatalogViewProps) {
  const [filter, setFilter] = useState<CategoryFilter>('semua')
  const [lifetime, setLifetime] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    getOrInitStats()
      .then((stats) => {
        if (!cancelled) setLifetime(stats.lifetimeByDzikir)
      })
      .catch(() => {
        // Tanpa database, katalog tetap tampil dengan hitungan 0.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const items = DZIKIR_SEED.filter((item) => filter === 'semua' || item.category === filter)

  return (
    <div className="px-4 pb-6 pt-4">
      <h1 className="text-xl font-bold">Katalog &amp; Makna</h1>
      <p className="mt-1 text-sm text-slate-400">
        Makna dan keutamaan terbuka bertahap seiring dzikirmu.
      </p>

      <div role="tablist" aria-label="Kategori" className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === value
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                : 'border-slate-700 bg-slate-900 text-slate-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {items.map((item) => (
          <CatalogCard
            key={item.id}
            item={item}
            lifetimeCount={lifetime[item.id] ?? 0}
            onStart={() => onStartDzikir(item.id)}
          />
        ))}
      </ul>
    </div>
  )
}

interface CatalogCardProps {
  item: DzikirItem
  lifetimeCount: number
  onStart: () => void
}

function CatalogCard({ item, lifetimeCount, onStart }: CatalogCardProps) {
  const unlocked2 = lifetimeCount >= LEVEL_THRESHOLDS[2]
  const unlocked3 = lifetimeCount >= LEVEL_THRESHOLDS[3]

  return (
    <li className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{item.title}</h2>
          <p className="text-xs text-slate-400">
            {CATEGORY_LABELS[item.category]} · {item.transliteration}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-bold tabular-nums text-amber-300">
          {lifetimeCount}x
        </span>
      </div>

      <div className="mt-3 max-h-[30vh] overflow-y-auto overscroll-contain">
        <p
          dir="rtl"
          lang="ar"
          className={`text-center font-arabic leading-relaxed text-slate-100 ${item.arabic.length > 200 ? 'text-2xl' : 'text-3xl'}`}
        >
          {item.arabic}
        </p>
      </div>

      <div className="mt-3 flex flex-col gap-3">
        <MeaningTier
          title="Level 1 · Makna Inti"
          unlocked
          lifetimeCount={lifetimeCount}
          threshold={LEVEL_THRESHOLDS[1]}
        >
          {item.meanings.level1}
        </MeaningTier>
        <MeaningTier
          title="Level 2 · Manfaat & Keutamaan"
          unlocked={unlocked2}
          lifetimeCount={lifetimeCount}
          threshold={LEVEL_THRESHOLDS[2]}
        >
          {item.meanings.level2}
        </MeaningTier>
        <MeaningTier
          title="Level 3 · Refleksi Harian & Dalil"
          unlocked={unlocked3}
          lifetimeCount={lifetimeCount}
          threshold={LEVEL_THRESHOLDS[3]}
        >
          <>
            {item.meanings.level3}
            <span className="mt-2 block text-xs text-slate-400">Sumber: {item.sourceRef}</span>
          </>
        </MeaningTier>
      </div>

      <button type="button" onClick={onStart} className={`${PRIMARY_BUTTON} mt-5`}>
        Mulai Dzikir Ini
      </button>
    </li>
  )
}

interface MeaningTierProps {
  title: string
  unlocked: boolean
  lifetimeCount: number
  threshold: number
  children: ReactNode
}

function MeaningTier({ title, unlocked, lifetimeCount, threshold, children }: MeaningTierProps) {
  if (unlocked) {
    return (
      <section className="rounded-2xl bg-slate-800/70 p-4">
        <h3 className="text-xs font-bold uppercase tracking-wide text-emerald-300">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{children}</p>
      </section>
    )
  }

  const progress = Math.min(lifetimeCount / threshold, 1)
  return (
    <section className="rounded-2xl border border-dashed border-slate-700 p-4">
      <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
        {title}
      </h3>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={threshold}
        aria-valuenow={Math.min(lifetimeCount, threshold)}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"
      >
        <div
          className="h-full rounded-full bg-sky-400 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs tabular-nums text-slate-400">
        {lifetimeCount} / {threshold}x
      </p>
    </section>
  )
}
