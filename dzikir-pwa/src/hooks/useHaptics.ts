import { useCallback, useState } from 'react'

const STORAGE_KEY = 'dzikir_haptics_muted'

function readMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    // Penyimpanan diblokir (mode privat, dsb.): anggap tidak dibisukan.
    return false
  }
}

function writeMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(muted))
  } catch {
    // Abaikan: preferensi hanya berlaku selama sesi ini.
  }
}

export function useHaptics() {
  const [muted, setMuted] = useState<boolean>(readMuted)

  const toggleMuted = useCallback(() => {
    const next = !muted
    setMuted(next)
    writeMuted(next)
  }, [muted])

  /** Getar singkat setiap tap. */
  const triggerTap = useCallback(() => {
    if (!muted) navigator.vibrate?.(20)
  }, [muted])

  /** Getar ganda untuk kelipatan 33, target tercapai, atau level baru. */
  const triggerMilestone = useCallback(() => {
    if (!muted) navigator.vibrate?.([40, 60, 40])
  }, [muted])

  return { muted, toggleMuted, triggerTap, triggerMilestone }
}
