import { BadgeCheck, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import { formatDateRange } from '../../utils/date'
import { coverBackground } from '../../utils/mountainLabels'

// kartu entri di profil publik; kartu membuka halaman entri, tombol suka berdiri sendiri di bawahnya
export default function PublicEntryCard({ entry, like, onToggleLike }) {
  const { slug, mountain, route, startDate, endDate, verified } = entry

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-paper md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg">
      <Link to={`/e/${slug}`} className="block">
        <div className="h-[110px] md:h-[150px]" style={{ background: coverBackground(mountain.cover) }} />
        <div className="px-[13px] pt-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <h3 className="text-[13px] font-bold">{mountain.name}</h3>
            {verified && (
              <Badge>
                <BadgeCheck size={11} />
                Terverifikasi
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[10.5px] text-mute md:text-[11.5px]">
            Via {route} · {formatDateRange(startDate, endDate)}
          </p>
        </div>
      </Link>

      <div className="px-[13px] pb-[11px] pt-[9px]">
        <button
          type="button"
          onClick={onToggleLike}
          aria-pressed={like.liked}
          className={`flex items-center gap-[5px] text-[11.5px] ${like.liked ? 'font-semibold text-warn' : 'text-mute'}`}
        >
          <Heart size={13} className={like.liked ? 'fill-warn text-warn' : ''} />
          {like.count} suka
        </button>
      </div>
    </article>
  )
}
