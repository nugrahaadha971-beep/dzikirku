/** Logo DzikirKu: bulan sabit emas-hijau dengan butir tasbih, diikuti nama merek. */
export function BrandLogo() {
  return (
    <span className="flex items-center gap-2" aria-label="DzikirKu">
      <svg viewBox="0 0 120 120" className="h-8 w-8" aria-hidden="true">
        <circle cx="58" cy="60" r="52" fill="#F3CFA0" />
        <circle cx="58" cy="60" r="46" fill="#2E8B67" />
        <circle cx="78" cy="52" r="40" fill="#FFFFFF" />
        <g fill="#2E8B67">
          <circle cx="96" cy="30" r="5" />
          <circle cx="106" cy="44" r="5" />
          <circle cx="108" cy="62" r="5" />
          <circle cx="102" cy="80" r="5" />
          <circle cx="90" cy="94" r="5" />
        </g>
      </svg>
      <span className="text-lg font-extrabold tracking-tight text-emerald-500">DzikirKu</span>
    </span>
  )
}
