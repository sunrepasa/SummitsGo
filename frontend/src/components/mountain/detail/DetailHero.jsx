import { ArrowLeft, MapPin } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { coverBackground, difficultyLabel } from '../../../utils/mountainLabels'
import { formatLocation } from '../../../utils/mountainDetail'

export default function DetailHero({ mountain: m }) {
  const navigate = useNavigate()
  const location = useLocation()

  // dibuka langsung lewat URL (tanpa riwayat) -> kembali ke Cari, bukan keluar dari aplikasi
  const back = () => navigate(location.key === 'default' ? '/search' : -1)

  return (
    <div className="md:pt-6">
      <div
        className="relative h-[210px] md:mb-6 md:h-[250px] md:overflow-hidden md:rounded-[22px]"
        style={{ background: coverBackground(m.cover) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.4),transparent_60%)]" />

        <button
          type="button"
          onClick={back}
          aria-label="Kembali"
          className="absolute left-4 top-4 flex size-[34px] items-center justify-center rounded-full bg-black/35 text-white md:left-[18px] md:top-[18px] md:size-auto md:gap-1.5 md:bg-white/90 md:px-[15px] md:py-2 md:text-[12.5px] md:font-semibold md:text-ink"
        >
          <ArrowLeft size={16} />
          <span className="hidden md:inline">Kembali</span>
        </button>

        <span
          className={`absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold md:right-[18px] md:top-[18px] md:px-3.5 md:text-xs md:font-bold ${
            m.difficulty === 'hard' ? 'text-warn' : 'text-pine'
          }`}
        >
          {difficultyLabel[m.difficulty]}
        </span>

        <div className="absolute bottom-4 left-5 right-5 text-white md:bottom-[26px] md:left-8">
          <h1 className="font-heading text-[21px] font-bold md:text-[34px]">{m.name}</h1>
          <p className="mt-0.5 flex items-center gap-1 text-[12.5px] opacity-90 md:text-sm">
            <MapPin size={13} />
            {formatLocation(m)}
          </p>
        </div>
      </div>
    </div>
  )
}
