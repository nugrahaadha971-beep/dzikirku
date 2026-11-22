# DzikirKu (dzikir-pwa) — Project Context & Main Specification

Aplikasi web progresif (offline-first PWA) penghitung dan panduan dzikir harian yang gamified bernama **DzikirKu**, dirancang 100% local-first tanpa backend, tanpa sistem autentikasi/login luar, dan tanpa pelacak eksternal.

- **Repositori GitHub:** [nugrahaadha971-beep/dzikirku](https://github.com/nugrahaadha971-beep/dzikirku)
- **Live Demo / GitHub Pages:** [https://nugrahaadha971-beep.github.io/dzikirku/](https://nugrahaadha971-beep.github.io/dzikirku/)
- **Base URL:** `/dzikirku/`

---

## 1. Tech Stack & Konfigurasi

| Komponen | Pilihan Teknologi & Versi |
|---|---|
| **Framework** | React 19 + TypeScript 5.9 + Vite 7 |
| **Styling** | Tailwind CSS v4 (Mobile-first, nuansa hijau zamrud `#2E8B67` & krem hangat `#F3CFA0`) |
| **Database** | Dexie.js v4 (IndexedDB) — 100% Local-First |
| **Ikon & Maskot** | `lucide-react`, maskot Hudi (`.riv` & SVG/PNG fallback) |
| **PWA & Offline** | `vite-plugin-pwa` (Service Worker Workbox, precaching offline penuh) |
| **CI/CD** | GitHub Actions (`.github/workflows/deploy.yml`) ke GitHub Pages |

### Aturan Kompatibilitas Aset Statis
Setiap pemanggilan aset di folder `public/` wajib menggunakan format `${import.meta.env.BASE_URL}`:
```ts
const BASE = import.meta.env.BASE_URL
const mascotUrl = `${BASE}mascot/hudi-idle.png`
```

---

## 2. Struktur Proyek

```
dzikirku/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD GitHub Actions: Build & Deploy ke Pages (--base=/dzikirku/)
├── ANTIGRAVITY.md                # Dokumen konteks & spesifikasi arsitektur proyek
└── dzikir-pwa/
    ├── public/
    │   ├── favicon.svg
    │   ├── pwa-192x192.png
    │   ├── pwa-512x512.png
    │   ├── maskable-512x512.png
    │   └── mascot/               # hudi.riv (opsional) + fallback hudi-{idle,focus,encourage,celebrate}.png
    ├── src/
    │   ├── data/
    │   │   ├── dzikirSeed.ts     # Dataset bacaan sahih (Pagi, Petang, Sebelum Tidur, Harian)
    │   │   └── routines.ts       # Definisi paket rutinitas & rekomendasi jadwal
    │   ├── db/
    │   │   └── dexie.ts          # Skema DzikirDB (sessions, stats, routineRuns), streak & backup JSON
    │   ├── hooks/
    │   │   ├── useClock.ts       # Deteksi waktu lokal (Pagi/Petang/Tidur) interval 60 detik
    │   │   └── useHaptics.ts     # Haptic feedback (navigator.vibrate) tap & milestone
    │   ├── components/
    │   │   ├── BrandLogo.tsx
    │   │   ├── MascotStage.tsx
    │   │   ├── OnboardingFlow.tsx
    │   │   ├── HomeView.tsx
    │   │   ├── TasbihView.tsx
    │   │   ├── PlayerView.tsx
    │   │   ├── CatalogView.tsx
    │   │   ├── ArticlesView.tsx
    │   │   ├── StatsBackupModal.tsx
    │   │   └── SettingsView.tsx
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 3. Database & Skema (Dexie.js)

Database IndexedDB bernama `DzikirDB` terdiri dari 3 tabel:

### 1. `sessions`
Tabel catatan hitungan dzikir harian.
- Skema index: `++id, [dzikirId+localDate], dzikirId, localDate, count, target, completed, updatedAt`
- Tanggal: format `YYYY-MM-DD` (zona waktu lokal perangkat).

### 2. `stats`
Tabel tunggal (`id: 'singleton'`) ringkasan statistik & gamifikasi.
- `id`: `'singleton'`
- `totalAllTime`: total kumulatif hitungan seluruh bacaan
- `currentStreak`: streak hari aktif berjalan
- `longestStreak`: rekor streak terpanjang
- `lastActiveDate`: tanggal lokal terakhir aktif (`YYYY-MM-DD`)
- `freezesAvailable`: jumlah freeze aktif (maks. 2; bertambah +1 setiap 7 hari aktif berturut-turut)
- `freezeUsedDate`: tanggal terakhir freeze terpakai
- `activeDaysCount`: jumlah total hari aktif
- `preferredDzikirId`: dzikir default pilihan pengguna
- `customTargets`: objek pemetaan target kustom `{ [dzikirId]: number }`
- `lifetimeByDzikir`: hitungan kumulatif per dzikir `{ [dzikirId]: number }`

### 3. `routineRuns`
Tabel progres paket rutinitas (Pagi, Petang, Sebelum Tidur, dsb.).
- Skema index: `key, routineId, localDate`
- `key`: `${routineId}|${localDate}`
- `counts`: `number[]` progres hitungan masing-masing bacaan dalam rutinitas.

### Cadangan & Pemulihan (JSON Backup)
- `exportDatabaseJson()`: Menghasilkan berkas JSON berisi ketiga tabel (`sessions`, `stats`, `routineRuns`) dengan cap waktu ISO/epoch.
- `importDatabaseJson()`: Validasi tipe data dan skema ketat sebelum mengganti data database IndexedDB.

---

## 4. Maskot Hudi (MascotStage)

- Maskot berbentuk burung Hud-hud dengan 4 pose/ekspresi:
  1. `idle`: santai/menyapa
  2. `focus`: konsentrasi berdzikir
  3. `encourage`: menyemangati/menjaga streak saat freeze
  4. `celebrate`: merayakan target/pencapaian (ekspresi gembira)
- **Anti-Terpotong:** Menggunakan `object-contain` dan ukuran responsif tanpa `overflow-hidden` kaku yang memotong tubuh maskot.
- **Rive + Fallback Otomatis:**
  1. Memuat `${BASE}mascot/hudi.riv` bila tersedia.
  2. Bila `.riv` tidak tersedia atau gagal dimuat, beralih otomatis ke gambar PNG `${BASE}mascot/hudi-${pose}.png`.
  3. Bila berkas PNG tidak tersedia, beralih ke rendering SVG Hud-hud bawaan dengan animasi CSS halus.

---

## 5. Penghitung Tasbih (TasbihView)

- **Satu Tombol Hitung Utama:** Lingkaran counter besar di tengah layar berfungsi langsung sebagai tombol tap utama (menampilkan cincin progres, angka hitungan, target, teks Arab, transliterasi Latin, dan arti).
- **Tanpa Tombol Ganda:** Menghindari tombol "TEKAN" tambahan di bagian bawah.
- Kontrol pendamping yang bersih dan terisolasi: Tombol `-1` (Undo), tombol Reset, serta pemilih target cepat (33, 100, 333, atau kustom).

---

## 6. Konten Sahih & Pemutar Rutinitas

- **Sumber Rujukan:** Almanhaj & Rumaysho (hadits sahih/hasan).
- **Dzikir Sebelum Tidur Lengkap (13 Bacaan):**
  1. Tiga Qul (Al-Ikhlas, Al-Falaq, An-Naas 3x)
  2. Ayat Kursi
  3. QS. Al-Baqarah 285–286
  4. Doa meletakkan lambung (*Bismika Rabbi wadha'tu jambii...*)
  5. Doa perlindungan jiwa (*Allahumma innaka khalaqta nafsii...*)
  6. Doa dijauhkan dari siksa hari kiamat (*Allahumma qinii 'adzaabaka...*)
  7. Doa sebelum tidur (*Bismika Allahumma amuutu wa ahyaa*)
  8. Tasbih 33x, Tahmid 33x, Takbir 34x
  9. Doa pelunasan utang & kecukupan (*Allahumma Rabbas-samaawaatis-sab'i...*)
  10. Doa syukur makan/minum/berteduh (*Alhamdulillaahilladzii ath'amanaa wa saqaanaa...*)
  11. Doa perlindungan dari kejahatan diri & setan (*Allahumma 'Aalimal-ghaibi wasy-syahaadati...*)
  12. Anjuran membaca Surah As-Sajdah & Al-Mulk
  13. Doa penutup berserah diri (*Allahumma aslamtu nafsii ilaika...*)
- **Dilarang Memotong Teks:** Teks Arab lengkap dengan harakat, transliterasi Latin, dan terjemahan utuh tanpa `.slice()`, `.substring()`, atau pemotongan CSS `line-clamp`. Area bacaan dapat digulir (*scrollable*) dengan nyaman.
