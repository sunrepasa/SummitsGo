import { Link } from 'react-router-dom'
import { BadgeCheck, ChevronRight } from 'lucide-react'
import Badge from '../ui/Badge'
import { formatDateRange, formatNights } from '../../utils/date'
import { coverBackground } from '../../utils/mountainLabels'

export default function LogbookListItem({ entry, repeat = 1 }) {
  const { id, mountain, route, startDate, endDate, nights, verified } = entry
  const duration = formatNights(nights)

  return (
    <Link
      to={`/logbook/${id}`}
      className="flex items-center gap-3 rounded-[14px] border border-line bg-paper p-3 md:gap-[18px] md:rounded-2xl md:py-3.5 md:pl-3.5 md:pr-[18px] md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg"
    >
      <div
        className="size-14 shrink-0 rounded-[10px] md:size-[84px] md:rounded-xl"
        style={{ background: coverBackground(mountain.cover) }}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 md:gap-x-2">
          <h3 className="whitespace-nowrap text-[13.5px] font-bold md:text-base">{mountain.name}</h3>
          {verified && (
            <Badge>
              <BadgeCheck size={11} />
              Terverifikasi
            </Badge>
          )}
          {repeat > 1 && <Badge variant="muted">×{repeat}</Badge>}
        </div>
        <p className="mt-0.5 text-[11px] text-mute md:mt-[5px] md:text-[12.5px]">
          Via {route}
          {!verified && ' · Ditambahkan manual'}
        </p>
        <p className="mt-[5px] text-[10.5px] text-mute md:mt-[3px] md:text-xs">
          {formatDateRange(startDate, endDate)}
          {duration && ` · ${duration}`}
        </p>
      </div>

      <ChevronRight size={16} className="shrink-0 text-mute md:size-5" />
    </Link>
  )
}

export function LogbookListItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-[14px] border border-line bg-paper p-3 md:gap-[18px] md:rounded-2xl md:py-3.5 md:pl-3.5 md:pr-[18px]">
      <div className="size-14 shrink-0 rounded-[10px] bg-line md:size-[84px] md:rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-1/2 rounded bg-line" />
        <div className="h-3 w-1/3 rounded bg-line" />
        <div className="h-3 w-2/3 rounded bg-line" />
      </div>
    </div>
  )
}