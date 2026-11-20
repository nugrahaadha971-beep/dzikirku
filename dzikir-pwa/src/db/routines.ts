import {
  db,
  getLocalDateString,
  getOrInitStats,
  recordTap,
  undoTap,
  type RoutineRun,
  type UserStats,
} from './dexie'
import { getDzikirById } from '../data/dzikirSeed'
import { getRoutine, type Routine } from '../data/routines'

/**
 * Hitungan per rutinitas disimpan di `routineRuns`. Setiap tap tetap lewat
 * `recordTap`, jadi total, streak, dan level makna (lifetime) tetap benar.
 */

export function runKey(routineId: string, date: string): string {
  return `${routineId}|${date}`
}

export function getItemTarget(stats: UserStats, dzikirId: string): number {
  return stats.customTargets[dzikirId] ?? getDzikirById(dzikirId).defaultTarget
}

export async function getTodayRuns(): Promise<Record<string, RoutineRun>> {
  const rows = await db.routineRuns.where('localDate').equals(getLocalDateString()).toArray()
  return Object.fromEntries(rows.map((row) => [row.routineId, row]))
}

export interface RoutineProgress {
  done: boolean
  /** Indeks bacaan pertama yang belum selesai, atau -1 bila semua selesai. */
  firstOpen: number
  /** Nomor bacaan untuk tampilan "Bacaan k/N". */
  current: number
  total: number
  counts: number[]
}

export function getRoutineProgress(
  routine: Routine,
  run: RoutineRun | null | undefined,
  stats: UserStats,
): RoutineProgress {
  const counts = routine.items.map((_, index) => run?.counts[index] ?? 0)
  const firstOpen = routine.items.findIndex(
    (dzikirId, index) => counts[index] < getItemTarget(stats, dzikirId),
  )
  const total = routine.items.length
  return {
    done: firstOpen === -1,
    firstOpen,
    current: firstOpen === -1 ? total : firstOpen + 1,
    total,
    counts,
  }
}

async function mutateRun(
  routineId: string,
  mutate: (run: RoutineRun) => void,
): Promise<RoutineRun> {
  const routine = getRoutine(routineId)
  const date = getLocalDateString()
  return db.transaction('rw', db.routineRuns, async () => {
    const existing = await db.routineRuns.get(runKey(routineId, date))
    const run: RoutineRun = existing ?? {
      key: runKey(routineId, date),
      routineId,
      localDate: date,
      counts: routine.items.map(() => 0),
    }
    mutate(run)
    await db.routineRuns.put(run)
    return run
  })
}

async function getRun(routineId: string): Promise<RoutineRun | undefined> {
  return db.routineRuns.get(runKey(routineId, getLocalDateString()))
}

export interface RoutineTapResult {
  run: RoutineRun
  stats: UserStats
  newlyUnlockedLevel: 2 | 3 | null
}

/** Mengembalikan null bila bacaan ini sudah mencapai target (tap diabaikan). */
export async function recordRoutineTap(
  routineId: string,
  index: number,
  target: number,
): Promise<RoutineTapResult | null> {
  const routine = getRoutine(routineId)
  const dzikirId = routine.items[index]
  if (!dzikirId) return null

  const current = await getRun(routineId)
  if ((current?.counts[index] ?? 0) >= target) return null

  const tap = await recordTap(dzikirId, target)
  const run = await mutateRun(routineId, (next) => {
    next.counts[index] = (next.counts[index] ?? 0) + 1
  })
  return { run, stats: tap.stats, newlyUnlockedLevel: tap.newlyUnlockedLevel }
}

export async function undoRoutineTap(
  routineId: string,
  index: number,
): Promise<{ run: RoutineRun; stats: UserStats } | null> {
  const routine = getRoutine(routineId)
  const dzikirId = routine.items[index]
  const current = await getRun(routineId)
  if (!dzikirId || !current || (current.counts[index] ?? 0) <= 0) return null

  const undone = await undoTap(dzikirId)
  const run = await mutateRun(routineId, (next) => {
    next.counts[index] = Math.max(0, (next.counts[index] ?? 0) - 1)
  })
  return { run, stats: undone.stats }
}

/** Mengulang satu bacaan dari nol; total dan lifetime ikut dikurangi. */
export async function resetRoutineItem(
  routineId: string,
  index: number,
): Promise<{ run: RoutineRun; stats: UserStats } | null> {
  const routine = getRoutine(routineId)
  const dzikirId = routine.items[index]
  const current = await getRun(routineId)
  if (!dzikirId || !current) return null

  for (let remaining = current.counts[index] ?? 0; remaining > 0; remaining -= 1) {
    await undoTap(dzikirId)
  }
  const run = await mutateRun(routineId, (next) => {
    next.counts[index] = 0
  })
  return { run, stats: await getOrInitStats() }
}

/** "Ulangi dzikir": hitungan rutinitas hari ini kembali ke nol. */
export async function restartRoutine(routineId: string): Promise<RoutineRun> {
  return mutateRun(routineId, (run) => {
    run.counts = run.counts.map(() => 0)
  })
}
