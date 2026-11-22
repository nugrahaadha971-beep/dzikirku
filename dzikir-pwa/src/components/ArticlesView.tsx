import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { ARTICLES, type Article } from '../data/routines'
import { MascotStage } from './MascotStage'

function ArticleArt({ art }: { art: Article['art'] }) {
  if (art === 'sunrise') {
    return (
      <svg viewBox="0 0 280 118" role="img" aria-label="Matahari terbit di atas perbukitan" className="w-full">
        <rect width="280" height="118" rx="16" fill="#BFE3C9" />
        <rect y="52" width="280" height="66" fill="#FBE6A6" />
        <circle cx="140" cy="78" r="30" fill="#F6B73C" />
        <path d="M0 84C50 62 90 90 140 80C190 70 230 62 280 82V118H0z" fill="#6DB58A" />
        <path d="M0 100C60 86 120 108 180 96C220 88 250 92 280 98V118H0z" fill="#4A9B6E" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 280 118" role="img" aria-label="Hati di tengah hujan" className="w-full">
      <rect width="280" height="118" rx="16" fill="#B9D5DC" />
      <path d="M0 92C60 80 120 98 180 88C230 80 260 84 280 90V118H0z" fill="#8FB8C3" />
      <path
        d="M140 96C108 70 96 54 96 42a18 18 0 0 1 44-6a18 18 0 0 1 44 6c0 12-12 28-44 54z"
        fill="#FB7185"
        transform="translate(0 -6)"
      />
      <g stroke="#D9EEF2" strokeWidth="2" strokeLinecap="round">
        <path d="M30 20l-6 14M70 8l-6 14M210 14l-6 14M250 30l-6 14M60 60l-6 14M230 66l-6 14" />
      </g>
    </svg>
  )
}

export function ArticlesView() {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = ARTICLES.find((article) => article.id === openId)

  if (open) {
    return (
      <article className="px-4 pb-6 pt-2">
        <button
          type="button"
          aria-label="Kembali"
          onClick={() => setOpenId(null)}
          className="rounded-full p-2 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="mt-2">
          <ArticleArt art={open.art} />
        </div>
        <span className="mt-4 inline-block rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
          {open.category}
        </span>
        <h1 className="mb-3 mt-2 text-2xl font-bold leading-snug">{open.title}</h1>
        {open.paragraphs.map((paragraph) => (
          <p key={paragraph} className="mb-3 leading-relaxed text-slate-200">
            {paragraph}
          </p>
        ))}
      </article>
    )
  }

  return (
    <div className="px-4 pb-6 pt-2">
      <h1 className="mb-4 text-center text-lg font-bold">Kabar &amp; Hikmah</h1>
      <ul className="flex flex-col gap-4">
        {ARTICLES.map((article) => (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => setOpenId(article.id)}
              className="block w-full rounded-3xl border border-slate-800 bg-slate-900 p-3 text-left transition-colors hover:border-slate-700"
            >
              <ArticleArt art={article.art} />
              <span className="mx-1 mt-3 block text-base font-extrabold leading-snug">{article.title}</span>
              <span className="mx-1 mt-2 flex items-center gap-2">
                <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  {article.category}
                </span>
                <span className="text-xs text-slate-400">{article.minutes} menit baca</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <MascotStage mood="freeze" message="Yuk, baca hikmah hari ini!" />
      </div>
    </div>
  )
}
