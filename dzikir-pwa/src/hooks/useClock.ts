import { useEffect, useState } from 'react'

export type TimePeriod = 'pagi' | 'petang' | 'tidur'

/**
 * Deteksi waktu lokal perangkat:
 * - Pagi: 03.00 - 14.59
 * - Petang: 15.00 - 19.59
 * - Tidur: 20.00 - 02.59
 */
export function getTimePeriod(date: Date = new Date()): TimePeriod {
  const hour = date.getHours()
  if (hour >= 3 && hour < 15) return 'pagi'
  if (hour >= 15 && hour < 20) return 'petang'
  return 'tidur'
}

/** Jam lokal perangkat. Diperbarui tiap 60 detik (interval 60.000 ms) dan saat aplikasi kembali terlihat. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const refresh = () => setNow(new Date())
    const timer = window.setInterval(refresh, 60_000)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  return now
}

/** Hook reaktif untuk mendapatkan periode waktu saat ini ('pagi' | 'petang' | 'tidur'). */
export function useTimePeriod(): TimePeriod {
  const now = useClock()
  return getTimePeriod(now)
}
