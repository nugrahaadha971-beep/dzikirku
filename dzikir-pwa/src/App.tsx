import { useEffect, useState, type ReactNode } from 'react'
import { ArrowLeft, Compass, Download, Newspaper, Route, Settings, Sun } from 'lucide-react'
import { ArticlesView } from './components/ArticlesView'
import { BrandLogo } from './components/BrandLogo'
import { CatalogView } from './components/CatalogView'
import { HomeView } from './components/HomeView'
import { ONBOARDED_KEY, OnboardingFlow } from './components/OnboardingFlow'
import { PlayerView } from './components/PlayerView'
import { SettingsView } from './components/SettingsView'
import { TasbihView } from './components/TasbihView'
import { DEFAULT_DZIKIR_ID, getDzikirById } from './data/dzikirSeed'
import { getRoutineForNow } from './data/routines'
import { getOrInitStats, setPreferredDzikir } from './db/dexie'

type Phase = 'loading' | 'onboarding' | 'ready'
type Tab = 'beranda' | 'katalog' | 'hikmah' | 'setelan'

/** Event non-standar Chromium yang dipakai untuk memicu pemasangan PWA. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function readOnboarded(): boolean {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === 'true'
  } catch {
    return false
  }
}

export default function App() {
  const [phase, setPhase] = useState<Phase>(() =>
    readOnboarded() ? 'loading' : 'onboarding',
  )
  const [tab, setTab] = useState<Tab>('beranda')
  /** Rutinitas yang sedang dimainkan (layar tasbih penuh), atau null. */
  const [playingId, setPlayingId] = useState<string | null>(null)
  /** Tasbih bebas: layar TasbihView lama, tanpa sesi. */
  const [freeCount, setFreeCount] = useState(false)
  const [activeId, setActiveId] = useState<string>(DEFAULT_DZIKIR_ID)
  const [dataVersion, setDataVersion] = useState(0)
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)

  // Pengguna lama: muat dzikir pilihan terakhir sebelum menampilkan layar utama.
  useEffect(() => {
    if (phase !== 'loading') return
    let cancelled = false
    getOrInitStats()
      .then((stats) => {
        if (!cancelled) setActiveId(getDzikirById(stats.preferredDzikirId).id)
      })
      .catch(() => {
        // Database tidak tersedia: tiap layar menampilkan pesan kesalahannya.
      })
      .finally(() => {
        if (!cancelled) setPhase('ready')
      })
    return () => {
      cancelled = true
    }
  }, [phase])

  useEffect(() => {
    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    function onAppInstalled() {
      setInstallEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [])

  function selectDzikir(dzikirId: string) {
    setActiveId(dzikirId)
    setPreferredDzikir(dzikirId).catch(() => {
      // Preferensi gagal disimpan: tidak kritis.
    })
  }

  async function handleInstall() {
    if (!installEvent) return
    await installEvent.prompt()
    await installEvent.userChoice
    setInstallEvent(null)
  }

  async function handleDataImported() {
    try {
      const stats = await getOrInitStats()
      setActiveId(getDzikirById(stats.preferredDzikirId).id)
    } catch {
      // Biarkan dzikir aktif apa adanya.
    }
    setDataVersion((version) => version + 1)
  }

  if (phase === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={(dzikirId) => {
          setActiveId(dzikirId)
          setPhase('ready')
        }}
      />
    )
  }

  if (phase === 'loading') {
    return <div className="min-h-screen bg-slate-950" aria-busy="true" />
  }

  if (playingId !== null) {
    return <PlayerView routineId={playingId} onExit={() => setPlayingId(null)} />
  }

  if (freeCount) {
    return (
      <div className="mx-auto min-h-screen max-w-md bg-slate-950 text-slate-100">
        <div className="flex h-12 items-center px-2 pt-2">
          <button
            type="button"
            aria-label="Kembali"
            onClick={() => setFreeCount(false)}
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <span className="text-sm font-bold tracking-wide text-emerald-400">Tasbih bebas</span>
        </div>
        <TasbihView
          dzikirId={activeId}
          onSelectDzikir={selectDzikir}
          dataVersion={dataVersion}
          onDataImported={() => void handleDataImported()}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-slate-950 text-slate-100">
      <div className="flex h-10 items-center justify-between px-4 pt-2">
        <BrandLogo />
        {installEvent && (
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Instal Aplikasi
          </button>
        )}
      </div>

      <main style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom))' }}>
        {tab === 'beranda' && (
          <HomeView
            onStartRoutine={(routineId) => setPlayingId(routineId)}
            onFreeCount={() => setFreeCount(true)}
          />
        )}
        {tab === 'katalog' && (
          <CatalogView
            onStartDzikir={(dzikirId) => {
              selectDzikir(dzikirId)
              setFreeCount(true)
            }}
          />
        )}
        {tab === 'hikmah' && <ArticlesView />}
        {tab === 'setelan' && (
          <SettingsView dataVersion={dataVersion} onDataImported={() => void handleDataImported()} />
        )}
      </main>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-800 bg-slate-950/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex h-16 max-w-md items-center">
          <NavButton
            label="Beranda"
            active={tab === 'beranda'}
            onClick={() => setTab('beranda')}
            icon={<Route className="h-6 w-6" aria-hidden="true" />}
          />
          <NavButton
            label="Katalog"
            active={tab === 'katalog'}
            onClick={() => setTab('katalog')}
            icon={<Compass className="h-6 w-6" aria-hidden="true" />}
          />
          <div className="flex flex-1 justify-center">
            <button
              type="button"
              aria-label="Mulai dzikir"
              onClick={() => setPlayingId(getRoutineForNow().id)}
              className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full border-b-4 border-emerald-700 bg-emerald-500 text-white ring-4 ring-white transition-all active:translate-y-1 active:border-b-0"
            >
              <Sun className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <NavButton
            label="Hikmah"
            active={tab === 'hikmah'}
            onClick={() => setTab('hikmah')}
            icon={<Newspaper className="h-6 w-6" aria-hidden="true" />}
          />
          <NavButton
            label="Setelan"
            active={tab === 'setelan'}
            onClick={() => setTab('setelan')}
            icon={<Settings className="h-6 w-6" aria-hidden="true" />}
          />
        </div>
      </nav>
    </div>
  )
}

interface NavButtonProps {
  label: string
  active: boolean
  onClick: () => void
  icon: ReactNode
}

function NavButton({ label, active, onClick, icon }: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex h-full flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-colors ${
        active ? 'text-emerald-400' : 'text-slate-400'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
