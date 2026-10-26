import { Link } from 'react-router-dom'
import MountainCard, { MountainCardSkeleton } from './MountainCard'

export default function MountainSection({ title, to = '/search', state, markNew = false, fitTag = false }) {
  const { data, error, loading } = state

  return (
    <section className="pb-1.5 pt-4 md:pt-[26px]">
      <div className="mb-3 flex items-baseline justify-between md:mb-3.5">
        <h2 className="font-heading text-[16.5px] font-bold md:text-xl">{title}</h2>
        <Link to={to} className="text-[12.5px] font-medium text-mute md:text-[13px] md:font-semibold md:text-leaf-deep">
          Lihat semua
        </Link>
      </div>

      {error ? (
        <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">
          Gagal memuat data gunung. Coba muat ulang halaman.
        </p>
      ) : (
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-4 md:gap-[18px] md:overflow-visible md:px-0 md:pb-0">
          {loading
            ? Array.from({ length: 4 }, (_, i) => <MountainCardSkeleton key={i} />)
            : data.map((m) => (
                <MountainCard
                  key={m.id}
                  mountain={m}
                  isNew={markNew}
                  fitTag={fitTag && m.difficulty === 'beginner'}
                />
              ))}
        </div>
      )}
    </section>
  )
}