import { Link } from 'react-router-dom'
import { BadgeCheck, Heart } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDateRange } from '../../utils/date'
import { coverBackground } from '../../utils/mountainLabels'

export default function LogbookFeedCard({ entry }) {
  const { id, mountain, route, startDate, endDate, verified, likes } = entry

  return (
    <Link
      to={`/logbook/${id}`}
      className="block overflow-hidden rounded-2xl border border-line bg-paper md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg"
    >
      <div className="h-[110px] md:h-[150px]" style={{ background: coverBackground(mountain.cover) }} />

      <div className="px-[13px] py-[11px]">
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
        <p className="mt-[9px] flex items-center gap-[5px] text-[11.5px] text-mute">
          <Heart size={13} className="fill-warn text-warn" />
          {likes} suka
        </p>
      </div>
    </Link>
  )
}

export function LogbookFeedCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="h-[110px] bg-line md:h-[130px]" />
      <div className="space-y-2 px-[13px] py-[11px]">
        <div className="h-3.5 w-1/2 rounded bg-line" />
        <div className="h-3 w-2/3 rounded bg-line" />
      </div>
    </div>
  )
}