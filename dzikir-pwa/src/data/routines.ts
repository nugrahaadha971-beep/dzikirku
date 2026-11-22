export type RoutineIcon = 'sun' | 'moon' | 'star' | 'heart'

export interface Routine {
  id: string
  title: string
  icon: RoutineIcon
  /** ID dzikir (lihat dzikirSeed.ts), berurutan. */
  items: string[]
}

/**
 * Dzikir pagi dan petang dari Dzikir_Pagi_dan_Petang.md, dipisah sesuai waktunya.
 * Dzikir yang dibaca di kedua waktu tampil di kedua rutinitas, urutannya mengikuti md.
 */
export const ROUTINES: readonly Routine[] = [
  {
    id: 'pagi',
    title: 'Dzikir Pagi',
    icon: 'sun',
    items: [
      'ayat-kursi', 'al-ikhlas', 'al-falaq', 'an-naas',
      'pagi-memasuki', 'pagi-berserah',
      'sayyidul-istighfar', 'aafinii', 'afwa-aafiyah', 'alimal-ghaib',
      'bismillah-yadhurru', 'radhiitu', 'yaa-hayyu',
      'fithratil-islam', 'tasbih-pagi', 'ilmu-rezeki-amal',
      'subhanallah-wa-bihamdih',
    ],
  },
  {
    id: 'petang',
    title: 'Dzikir Petang',
    icon: 'moon',
    items: [
      'ayat-kursi', 'al-ikhlas', 'al-falaq', 'an-naas',
      'sore-memasuki', 'sore-berserah',
      'sayyidul-istighfar', 'aafinii', 'afwa-aafiyah', 'alimal-ghaib',
      'bismillah-yadhurru', 'radhiitu', 'yaa-hayyu',
      'subhanallah-wa-bihamdih', 'audzu-bikalimaat',
    ],
  },
  { id: 'sholat', title: 'Setelah Sholat', icon: 'star', items: ['tasbih', 'tahmid', 'takbir'] },
  { id: 'doa', title: 'Doa Harian', icon: 'heart', items: ['istighfar', 'tahlil', 'shalawat'] },
  {
    id: 'tidur',
    title: 'Dzikir Sebelum Tidur',
    icon: 'moon',
    items: [
      'al-ikhlas', 'al-falaq', 'an-naas',
      'ayat-kursi', 'al-baqarah-285',
      'bismika-robbi', 'khalaqta-nafsi', 'qinii-adzaab', 'bismika-amuutu',
      'tasbih', 'tahmid', 'takbir',
      'robbas-samawat', 'alhamdulillah-atamanaa', 'alimal-ghaib',
      'as-sajdah-mulk', 'aslamtu-nafsi',
    ],
  },
]

export function getRoutine(id: string): Routine {
  return ROUTINES.find((routine) => routine.id === id) ?? ROUTINES[0]
}

/**
 * Jadwal saran dzikir menurut jam lokal perangkat. Setiap rutinitas berlaku dari
 * jam mulainya sampai jam mulai berikutnya. Jam 00.00-02.59 masuk ke rutinitas
 * terakhir (tidur) dari malam sebelumnya.
 */
const SUGGESTION_SCHEDULE: readonly { startHour: number; routineId: string }[] = [
  { startHour: 3, routineId: 'pagi' },
  { startHour: 15, routineId: 'petang' },
  { startHour: 20, routineId: 'tidur' },
]

export function getRoutineIdForHour(hour: number): string {
  const last = SUGGESTION_SCHEDULE[SUGGESTION_SCHEDULE.length - 1]
  if (hour < SUGGESTION_SCHEDULE[0].startHour) return last.routineId
  let routineId = SUGGESTION_SCHEDULE[0].routineId
  for (const slot of SUGGESTION_SCHEDULE) {
    if (hour >= slot.startHour) routineId = slot.routineId
  }
  return routineId
}

/** Rutinitas yang disarankan untuk jam sekarang (dipakai beranda dan tombol tengah). */
export function getRoutineForNow(date: Date = new Date()): Routine {
  return getRoutine(getRoutineIdForHour(date.getHours()))
}

/** Saran berikutnya beserta jam mulainya, untuk pesan di beranda. */
export function getNextSuggestion(date: Date = new Date()): { routine: Routine; startHour: number } {
  const hour = date.getHours()
  const next = SUGGESTION_SCHEDULE.find((slot) => slot.startHour > hour) ?? SUGGESTION_SCHEDULE[0]
  return { routine: getRoutine(next.routineId), startHour: next.startHour }
}

export interface Article {
  id: string
  title: string
  category: 'Harian' | 'Ketenangan'
  minutes: number
  art: 'sunrise' | 'rain'
  paragraphs: string[]
}

export const ARTICLES: readonly Article[] = [
  {
    id: 'pagi-petang',
    title: 'Keutamaan Dzikir Pagi dan Petang',
    category: 'Harian',
    minutes: 1,
    art: 'sunrise',
    paragraphs: [
      'Al-Qur’an memerintahkan orang beriman untuk memperbanyak dzikir dan bertasbih pada waktu pagi dan petang (QS. Al-Ahzab: 41–42).',
      'Pagi dan petang adalah dua pintu hari: yang pertama untuk memulai dengan mengingat Allah, yang kedua untuk menutupnya dengan syukur dan permohonan ampun.',
      'Tidak perlu panjang. Mulailah dari tasbih yang ringan, lalu naikkan pelan-pelan. Yang utama adalah istiqomah, bukan banyaknya dalam sekali duduk.',
    ],
  },
  {
    id: 'istighfar',
    title: 'Menenangkan Hati dengan Istighfar',
    category: 'Ketenangan',
    minutes: 1,
    art: 'rain',
    paragraphs: [
      'Allah berfirman bahwa dengan mengingat-Nya hati menjadi tenteram (QS. Ar-Ra’d: 28).',
      'Istighfar adalah cara sederhana untuk melepas beban: mengakui kekurangan, memohon ampun, lalu kembali berharap pada rahmat-Nya.',
      'Saat gelisah, ucapkan “Astaghfirullah” perlahan sambil mengatur napas. Kamu bisa menghitungnya di sesi Doa Harian.',
    ],
  },
]
