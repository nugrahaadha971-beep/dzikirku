import { useState } from 'react'
import { ArrowLeft, CalendarCheck, Heart, Moon, WifiOff } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { applyOnboardingPreferences, type FocusCategory } from '../db/dexie'
import { MascotStage } from './MascotStage'
import { PRIMARY_BUTTON, choiceCardClass } from './buttonStyles'

export const ONBOARDED_KEY = 'dzikir_onboarded'

interface OnboardingFlowProps {
  onComplete: (dzikirId: string) => void
}

interface FocusOption {
  value: FocusCategory
  title: string
  description: string
  Icon: LucideIcon
}

const FOCUS_OPTIONS: FocusOption[] = [
  {
    value: 'ketenangan',
    title: 'Ketenangan Hati',
    description: 'Menenangkan pikiran dengan istighfar.',
    Icon: Heart,
  },
  {
    value: 'sholat',
    title: "Ba'da Shalat",
    description: 'Dzikir setelah shalat, dimulai dari tasbih.',
    Icon: Moon,
  },
  {
    value: 'harian',
    title: 'Kebiasaan Harian',
    description: 'Membangun rutinitas ringan lewat tahlil.',
    Icon: CalendarCheck,
  },
]

const TARGET_OPTIONS: { value: number; title: string; description: string }[] = [
  { value: 33, title: 'Santai • 33x', description: 'Ringan, pas untuk memulai.' },
  { value: 100, title: 'Rutin • 100x', description: 'Seimbang untuk keseharian.' },
  { value: 333, title: 'Istiqomah • 333x', description: 'Untuk yang ingin lebih dalam.' },
]

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [focus, setFocus] = useState<FocusCategory | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFinish() {
    if (focus === null || target === null) return
    void finish(focus, target)
  }

  async function finish(focusValue: FocusCategory, targetValue: number) {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const dzikirId = await applyOnboardingPreferences(focusValue, targetValue)
      try {
        localStorage.setItem(ONBOARDED_KEY, 'true')
      } catch {
        // Tanpa localStorage, onboarding akan muncul lagi di kunjungan berikutnya.
      }
      onComplete(dzikirId)
    } catch {
      setError('Penyimpanan lokal tidak tersedia di peramban ini. Coba tutup mode privat.')
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-6 pt-5">
      {step > 0 && (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setStep((step - 1) as 0 | 1)}
            aria-label="Kembali"
            className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={step === 1 ? 50 : 100}
            className="h-3 flex-1 overflow-hidden rounded-full bg-slate-800"
          >
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col justify-center gap-6">
        {step === 0 && (
          <>
            <div className="relative mx-auto h-64 w-64 rounded-full bg-[#FBE7C6]">
              <img
                src={`${import.meta.env.BASE_URL}mascot/hudi-idle.png`}
                alt="Hudi, maskot burung hud-hud, sedang melambai"
                draggable={false}
                className="absolute bottom-0 left-1/2 h-64 -translate-x-1/2 select-none"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-extrabold">Waktunya berdzikir!</h1>
              <p className="mt-2 text-slate-300">
                Mulai rutinitas dzikir harianmu untuk ketenangan hati.
              </p>
            </div>
            <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
              <WifiOff className="h-4 w-4" aria-hidden="true" />
              100% Offline &amp; Tanpa Login
            </p>
          </>
        )}

        {step === 1 && (
          <>
            <MascotStage
              mood="freeze"
              message="Apa yang paling ingin kamu rasakan dari dzikir?"
            />
            <div role="radiogroup" aria-label="Fokus dzikir" className="flex flex-col gap-3">
              {FOCUS_OPTIONS.map(({ value, title, description, Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={focus === value}
                  onClick={() => setFocus(value)}
                  className={choiceCardClass(focus === value)}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-6 w-6 shrink-0 text-emerald-400" aria-hidden="true" />
                    <span>
                      <span className="block font-bold">{title}</span>
                      <span className="block text-sm text-slate-400">{description}</span>
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-center text-2xl font-bold">
              Berapa hitungan yang nyaman?
            </h1>
            <div role="radiogroup" aria-label="Target harian" className="flex flex-col gap-3">
              {TARGET_OPTIONS.map(({ value, title, description }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={target === value}
                  onClick={() => setTarget(value)}
                  className={choiceCardClass(target === value)}
                >
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-slate-400">{description}</span>
                </button>
              ))}
            </div>
            {error && (
              <p role="alert" className="text-center text-sm text-rose-300">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      <div className="pt-6">
        {step === 0 && (
          <>
            <button type="button" className={PRIMARY_BUTTON} onClick={() => setStep(1)}>
              MULAI SEKARANG
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => void finish('sholat', 33)}
              className="mt-2 w-full py-3 text-sm font-bold tracking-wide text-slate-400 hover:text-slate-200"
            >
              NANTI
            </button>
          </>
        )}
        {step === 1 && (
          <button
            type="button"
            className={PRIMARY_BUTTON}
            disabled={focus === null}
            onClick={() => setStep(2)}
          >
            Lanjut
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            className={PRIMARY_BUTTON}
            disabled={target === null || submitting}
            onClick={handleFinish}
          >
            Mulai Sesi Pertama
          </button>
        )}
      </div>
    </div>
  )
}
