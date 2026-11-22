# DzikirKu (PWA offline)

```bash
npm install
npm run dev        # pengembangan
npm run build      # tsc -b && vite build -> dist/ (sw.js + manifest.webmanifest)
npm run preview
```

- Data tersimpan lokal (IndexedDB via Dexie); tanpa login atau backend.
- GitHub Pages di sub-path: tambahkan `base: '/nama-repo/'` di `vite.config.ts`.
- Maskot: jalankan `blender -b -P scripts/build_hudi_mascot.py` untuk merender
  PNG ke `public/mascot/`. Sebelum itu, aplikasi memakai avatar SVG cadangan.

## Struktur layar (desain DzikirKu)

- `OnboardingFlow`: sambutan "Waktunya berdzikir!" → fokus → target. "NANTI" memakai bawaan (Tasbih, 33x).
- `HomeView` (Beranda): streak, target, kartu sesi aktif, jalur node (Pagi, Petang, Setelah Sholat, Doa Harian).
- `PlayerView`: satu sesi, bacaan demi bacaan, dengan counter, makna bertahap, dan layar selesai.
- `CatalogView`, `ArticlesView` (Hikmah), `SettingsView`; `TasbihView` lama tetap ada sebagai "Tasbih bebas".
- Susunan sesi ada di `src/data/routines.ts` (`ROUTINES`), artikel di `ARTICLES`.

Hitungan per sesi disimpan di tabel Dexie `routineRuns` (skema v2). Tiap tap tetap lewat
`recordTap`, jadi total, streak, dan level makna ikut naik. Cadangan JSON (`exportDatabaseJson`)
belum memuat `routineRuns`; progres sesi harian tidak ikut dipulihkan.

Maskot: `public/mascot/hudi-*.png` dipotong dari gambar referensi (latar dihapus otomatis).
