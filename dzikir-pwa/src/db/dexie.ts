import Dexie, { type Table } from 'dexie'
import { DEFAULT_DZIKIR_ID } from '../data/dzikirSeed'

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export interface DzikirSession {
  id?: number
  dzikirId: string
  count: number
  target: number
  completed: boolean
  /** Tanggal lokal perangkat, format YYYY-MM-DD. */
  localDate: string
  updatedAt: number
}

/** Progres satu rutinitas (Pagi, Petang, dst.) pada satu hari. */
export interface RoutineRun {
  /** `${routineId}|${localDate}` */
  key: string
  routineId: string
  localDate: string
  /** Hitungan tiap bacaan, searah urutan `Routine.items`. */
  counts: number[]
}

export const STATS_ID = 'singleton' as const
export const MAX_FREEZES = 2

export interface UserStats {
  id: typeof STATS_ID
  totalAllTime: number
  currentStreak: number
  longestStreak: number
  lastActiveDate: string
  freezesAvailable: number
  freezeUsedDate: string
  activeDaysCount: number
  preferredDzikirId: string
  customTargets: Record<string, number>
  lifetimeByDzikir: Record<string, number>
}

export type FocusCategory = 'ketenangan' | 'sholat' | 'harian'

export interface TapResult {
  session: DzikirSession
  stats: UserStats
  newlyUnlockedLevel: 2 | 3 | null
}

export interface UndoResult {
  session: DzikirSession | null
  stats: UserStats
}

/* -------------------------------------------------------------------------- */
/* Database                                                                   */
/* -------------------------------------------------------------------------- */

class DzikirDB extends Dexie {
  declare sessions: Table<DzikirSession, number>
  declare stats: Table<UserStats, string>
  declare routineRuns: Table<RoutineRun, string>

  constructor() {
    super('DzikirDB')
    this.version(1).stores({
      sessions: '++id, dzikirId, count, target, completed, localDate, updatedAt',
      stats: 'id',
    })
    // v2: progres rutinitas. Tabel lama tidak berubah.
    this.version(2).stores({
      routineRuns: 'key, localDate',
    })
    // v3: index gabungan [dzikirId+localDate] & indeks routineId
    this.version(3).stores({
      sessions: '++id, [dzikirId+localDate], dzikirId, localDate, count, target, completed, updatedAt',
      stats: 'id',
      routineRuns: 'key, routineId, localDate',
    })
  }
}

export const db = new DzikirDB()

/* -------------------------------------------------------------------------- */
/* Dates (selalu zona waktu perangkat, tidak pernah UTC)                      */
/* -------------------------------------------------------------------------- */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Selisih hari kalender antara dua string YYYY-MM-DD (aman terhadap DST). */
function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number)
  const [ty, tm, td] = to.split('-').map(Number)
  const ms = Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)
  return Math.round(ms / 86_400_000)
}

/* -------------------------------------------------------------------------- */
/* Stats helpers                                                              */
/* -------------------------------------------------------------------------- */

function createDefaultStats(): UserStats {
  return {
    id: STATS_ID,
    totalAllTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    freezesAvailable: 1,
    freezeUsedDate: '',
    activeDaysCount: 0,
    preferredDzikirId: DEFAULT_DZIKIR_ID,
    customTargets: {},
    lifetimeByDzikir: {},
  }
}

function sanitizeTarget(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 33
}

/** Membaca stats tanpa menulis; mengembalikan default jika belum ada. */
async function loadStats(): Promise<UserStats> {
  return (await db.stats.get(STATS_ID)) ?? createDefaultStats()
}

export async function getOrInitStats(): Promise<UserStats> {
  return db.transaction('rw', db.stats, async () => {
    const existing = await db.stats.get(STATS_ID)
    if (existing) return existing
    const fresh = createDefaultStats()
    await db.stats.put(fresh)
    return fresh
  })
}

/**
 * Memperbarui streak pada tap pertama di tanggal lokal baru. Memutasi `stats`.
 *
 * - selisih 1 hari  : streak +1
 * - selisih 2 hari  : jika ada freeze, pakai satu (streak dipertahankan)
 * - selainnya       : streak mulai lagi dari 1
 * Setiap 7 hari aktif, satu freeze diisi ulang (maks. MAX_FREEZES).
 */
function applyDailyStreak(stats: UserStats, today: string): void {
  if (stats.lastActiveDate === '') {
    stats.currentStreak = 1
    stats.activeDaysCount += 1
  } else {
    const diff = daysBetween(stats.lastActiveDate, today)
    // Jam perangkat mundur: jangan ubah streak.
    if (diff < 0) return

    if (diff === 1) {
      stats.currentStreak += 1
      stats.activeDaysCount += 1
    } else if (diff === 2 && stats.freezesAvailable > 0) {
      stats.freezesAvailable -= 1
      stats.freezeUsedDate = today
      stats.activeDaysCount += 1
    } else {
      stats.currentStreak = 1
      stats.activeDaysCount += 1
    }
  }

  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak)
  stats.lastActiveDate = today

  if (stats.activeDaysCount % 7 === 0) {
    stats.freezesAvailable = Math.min(stats.freezesAvailable + 1, MAX_FREEZES)
  }
}

async function findTodaySession(
  dzikirId: string,
  today: string,
): Promise<DzikirSession | undefined> {
  return db.sessions
    .where('[dzikirId+localDate]')
    .equals([dzikirId, today])
    .first()
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

export async function getTodaySession(
  dzikirId: string,
): Promise<DzikirSession | undefined> {
  return findTodaySession(dzikirId, getLocalDateString())
}

export async function setPreferredDzikir(dzikirId: string): Promise<void> {
  await db.transaction('rw', db.stats, async () => {
    const stats = await loadStats()
    await db.stats.put({ ...stats, preferredDzikirId: dzikirId })
  })
}

const FOCUS_TO_DZIKIR: Record<FocusCategory, string> = {
  ketenangan: 'istighfar',
  sholat: 'tasbih',
  harian: 'tahlil',
}

export async function applyOnboardingPreferences(
  focusCategory: FocusCategory,
  dailyTarget: number,
): Promise<string> {
  const dzikirId = FOCUS_TO_DZIKIR[focusCategory]
  const target = sanitizeTarget(dailyTarget)

  await db.transaction('rw', db.stats, async () => {
    const stats = await loadStats()
    await db.stats.put({
      ...stats,
      preferredDzikirId: dzikirId,
      customTargets: { ...stats.customTargets, [dzikirId]: target },
    })
  })

  return dzikirId
}

export async function recordTap(
  dzikirId: string,
  target: number,
): Promise<TapResult> {
  const today = getLocalDateString()
  const safeTarget = sanitizeTarget(target)

  return db.transaction('rw', db.sessions, db.stats, async () => {
    const stats = await loadStats()
    const existing = await findTodaySession(dzikirId, today)
    const now = Date.now()

    // --- Sesi hari ini ---
    const count = (existing?.count ?? 0) + 1
    const completed = Boolean(existing?.completed) || count >= safeTarget
    const session: DzikirSession = existing
      ? { ...existing, count, target: safeTarget, completed, updatedAt: now }
      : {
          dzikirId,
          count,
          target: safeTarget,
          completed,
          localDate: today,
          updatedAt: now,
        }
    session.id = await db.sessions.put(session)

    // --- Statistik ---
    const next: UserStats = {
      ...stats,
      lifetimeByDzikir: { ...stats.lifetimeByDzikir },
    }
    const previousLifetime = next.lifetimeByDzikir[dzikirId] ?? 0
    const newLifetime = previousLifetime + 1
    next.lifetimeByDzikir[dzikirId] = newLifetime
    next.totalAllTime += 1

    if (stats.lastActiveDate !== today) applyDailyStreak(next, today)

    await db.stats.put(next)

    let newlyUnlockedLevel: 2 | 3 | null = null
    if (previousLifetime < 100 && newLifetime >= 100) newlyUnlockedLevel = 2
    else if (previousLifetime < 333 && newLifetime >= 333) newlyUnlockedLevel = 3

    return { session, stats: next, newlyUnlockedLevel }
  })
}

export async function undoTap(dzikirId: string): Promise<UndoResult> {
  const today = getLocalDateString()

  return db.transaction('rw', db.sessions, db.stats, async () => {
    const stats = await loadStats()
    const existing = await findTodaySession(dzikirId, today)

    // Tidak ada yang bisa dibatalkan pada sesi hari ini.
    if (!existing || existing.count <= 0) {
      return { session: existing ?? null, stats }
    }

    const count = existing.count - 1
    const session: DzikirSession = {
      ...existing,
      count,
      completed: count >= existing.target ? existing.completed : false,
      updatedAt: Date.now(),
    }
    await db.sessions.put(session)

    const next: UserStats = {
      ...stats,
      totalAllTime: Math.max(0, stats.totalAllTime - 1),
      lifetimeByDzikir: {
        ...stats.lifetimeByDzikir,
        [dzikirId]: Math.max(0, (stats.lifetimeByDzikir[dzikirId] ?? 0) - 1),
      },
    }
    await db.stats.put(next)

    return { session, stats: next }
  })
}

export async function resetSession(
  dzikirId: string,
): Promise<DzikirSession | null> {
  const today = getLocalDateString()

  return db.transaction('rw', db.sessions, async () => {
    const existing = await findTodaySession(dzikirId, today)
    if (!existing) return null

    const session: DzikirSession = {
      ...existing,
      count: 0,
      completed: false,
      updatedAt: Date.now(),
    }
    await db.sessions.put(session)
    return session
  })
}

export async function setCustomTarget(
  dzikirId: string,
  target: number,
): Promise<UserStats> {
  const sanitized = sanitizeTarget(target)
  return db.transaction('rw', db.stats, async () => {
    const stats = await loadStats()
    const next: UserStats = {
      ...stats,
      customTargets: { ...stats.customTargets, [dzikirId]: sanitized },
    }
    await db.stats.put(next)
    return next
  })
}

/* -------------------------------------------------------------------------- */
/* Backup / restore                                                           */
/* -------------------------------------------------------------------------- */

const BACKUP_APP = 'dzikirku'
const LEGACY_BACKUP_APP = 'hudi-dzikir'
const BACKUP_VERSION = 1
const MAX_SESSIONS = 200_000
const MAX_ROUTINE_RUNS = 100_000
const MAX_ROUTINE_ITEMS = 200
const MAX_COUNT = 1_000_000_000
const DATE_PATTERN = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,64}$/

export interface BackupFile {
  app: typeof BACKUP_APP
  version: typeof BACKUP_VERSION
  /** Waktu ekspor, epoch milidetik. */
  exportedAt: number
  sessions: DzikirSession[]
  stats: UserStats
  routineRuns?: RoutineRun[]
}

export async function exportDatabaseJson(): Promise<string> {
  const [sessions, stats, routineRuns] = await Promise.all([
    db.sessions.toArray(),
    getOrInitStats(),
    db.routineRuns.toArray(),
  ])
  const payload: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: Date.now(),
    sessions,
    stats,
    routineRuns,
  }
  return JSON.stringify(payload, null, 2)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(message: string): never {
  throw new Error(`Cadangan tidak valid: ${message}`)
}

function readInt(value: unknown, label: string, min: number, max: number): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    return fail(`${label} harus bilangan bulat ${min}–${max}.`)
  }
  return value
}

function readDate(value: unknown, label: string, allowEmpty: boolean): string {
  if (typeof value !== 'string') return fail(`${label} harus berupa teks.`)
  if (allowEmpty && value === '') return value
  if (!DATE_PATTERN.test(value)) return fail(`${label} harus berformat YYYY-MM-DD.`)
  return value
}

function readNumberMap(
  value: unknown,
  label: string,
  min: number,
): Record<string, number> {
  if (!isRecord(value)) return fail(`${label} harus berupa objek.`)
  const entries: [string, number][] = []
  for (const [key, raw] of Object.entries(value)) {
    if (!KEY_PATTERN.test(key) || key === '__proto__') {
      return fail(`${label} memuat kunci yang tidak valid.`)
    }
    entries.push([key, readInt(raw, `${label}.${key}`, min, MAX_COUNT)])
  }
  // fromEntries membuat properti data biasa (aman terhadap polusi prototipe).
  return Object.fromEntries(entries)
}

function validateStats(value: unknown): UserStats {
  if (!isRecord(value)) return fail('bagian "stats" hilang.')
  if (typeof value.preferredDzikirId !== 'string' || value.preferredDzikirId.length > 64) {
    return fail('preferredDzikirId harus berupa teks.')
  }
  return {
    id: STATS_ID,
    totalAllTime: readInt(value.totalAllTime, 'totalAllTime', 0, MAX_COUNT),
    currentStreak: readInt(value.currentStreak, 'currentStreak', 0, 100_000),
    longestStreak: readInt(value.longestStreak, 'longestStreak', 0, 100_000),
    lastActiveDate: readDate(value.lastActiveDate, 'lastActiveDate', true),
    freezesAvailable: readInt(value.freezesAvailable, 'freezesAvailable', 0, MAX_FREEZES),
    freezeUsedDate: readDate(value.freezeUsedDate, 'freezeUsedDate', true),
    activeDaysCount: readInt(value.activeDaysCount, 'activeDaysCount', 0, 100_000),
    preferredDzikirId: value.preferredDzikirId,
    customTargets: readNumberMap(value.customTargets, 'customTargets', 1),
    lifetimeByDzikir: readNumberMap(value.lifetimeByDzikir, 'lifetimeByDzikir', 0),
  }
}

function validateSession(value: unknown, index: number): DzikirSession {
  const label = `sessions[${index}]`
  if (!isRecord(value)) return fail(`${label} harus berupa objek.`)
  if (typeof value.dzikirId !== 'string' || !KEY_PATTERN.test(value.dzikirId)) {
    return fail(`${label}.dzikirId tidak valid.`)
  }
  if (typeof value.completed !== 'boolean') {
    return fail(`${label}.completed harus true/false.`)
  }
  return {
    dzikirId: value.dzikirId,
    count: readInt(value.count, `${label}.count`, 0, MAX_COUNT),
    target: readInt(value.target, `${label}.target`, 1, MAX_COUNT),
    completed: value.completed,
    localDate: readDate(value.localDate, `${label}.localDate`, false),
    updatedAt: readInt(value.updatedAt, `${label}.updatedAt`, 0, Number.MAX_SAFE_INTEGER),
  }
}

function validateRoutineRun(value: unknown, index: number): RoutineRun {
  const label = `routineRuns[${index}]`
  if (!isRecord(value)) return fail(`${label} harus berupa objek.`)
  const routineId = value.routineId
  if (typeof routineId !== 'string' || !KEY_PATTERN.test(routineId)) {
    return fail(`${label}.routineId tidak valid.`)
  }
  const localDate = readDate(value.localDate, `${label}.localDate`, false)
  const key = value.key
  if (typeof key !== 'string' || key !== `${routineId}|${localDate}`) {
    return fail(`${label}.key tidak cocok dengan rutinitas dan tanggalnya.`)
  }
  const counts = value.counts
  if (!Array.isArray(counts) || counts.length > MAX_ROUTINE_ITEMS) {
    return fail(`${label}.counts harus berupa daftar.`)
  }
  return {
    key,
    routineId,
    localDate,
    counts: counts.map((count, i) => readInt(count, `${label}.counts[${i}]`, 0, MAX_COUNT)),
  }
}

function validateRoutineRuns(value: unknown): RoutineRun[] {
  if (!Array.isArray(value)) return fail('"routineRuns" harus berupa daftar.')
  if (value.length > MAX_ROUTINE_RUNS) return fail('jumlah rutinitas terlalu besar.')
  const runs = value.map((run, index) => validateRoutineRun(run, index))
  if (new Set(runs.map((run) => run.key)).size !== runs.length) {
    return fail('ada rutinitas yang tercatat dua kali pada hari yang sama.')
  }
  return runs
}

function validateBackup(value: unknown): {
  sessions: DzikirSession[]
  stats: UserStats
  routineRuns: RoutineRun[] | undefined
} {
  if (!isRecord(value) || (value.app !== BACKUP_APP && value.app !== LEGACY_BACKUP_APP)) {
    return fail('bukan berkas cadangan DzikirKu.')
  }
  if (value.version !== BACKUP_VERSION) {
    return fail(`versi ${String(value.version)} tidak didukung.`)
  }
  if (!Array.isArray(value.sessions)) return fail('"sessions" harus berupa daftar.')
  if (value.sessions.length > MAX_SESSIONS) return fail('jumlah sesi terlalu besar.')

  return {
    sessions: value.sessions.map((session, index) => validateSession(session, index)),
    stats: validateStats(value.stats),
    // Cadangan lama (tanpa routineRuns) tetap bisa dipulihkan.
    routineRuns: value.routineRuns === undefined ? undefined : validateRoutineRuns(value.routineRuns),
  }
}

/**
 * Memulihkan cadangan. Seluruh data saat ini DIGANTI, dan semuanya divalidasi
 * lebih dulu sehingga cadangan rusak tidak pernah menyentuh database.
 */
export async function importDatabaseJson(rawJson: string): Promise<void> {
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch {
    throw new Error('Cadangan tidak valid: berkas bukan JSON yang benar.')
  }

  const backup = validateBackup(parsed)

  await db.transaction('rw', db.sessions, db.stats, db.routineRuns, async () => {
    await db.sessions.clear()
    await db.stats.clear()
    await db.sessions.bulkAdd(backup.sessions)
    await db.stats.put(backup.stats)
    // Cadangan lama tidak memuat progres rutinitas, jadi progres yang ada dibiarkan.
    if (backup.routineRuns) {
      await db.routineRuns.clear()
      await db.routineRuns.bulkAdd(backup.routineRuns)
    }
  })
}
