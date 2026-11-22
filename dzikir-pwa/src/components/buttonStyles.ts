/** Tombol utama bergaya taktil ala Duolingo. */
export const PRIMARY_BUTTON =
  'w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 px-6 py-4 text-base font-bold tracking-wide text-white transition-all active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-700 disabled:text-slate-400 disabled:active:translate-y-0 disabled:active:border-b-4'

/** Kartu pilihan (onboarding). */
export function choiceCardClass(selected: boolean): string {
  const base =
    'w-full rounded-2xl border-2 border-b-4 p-4 text-left transition-all active:translate-y-0.5 active:border-b-2'
  return selected
    ? `${base} border-emerald-500 bg-emerald-500/10`
    : `${base} border-slate-700 bg-slate-900 hover:border-slate-600`
}
