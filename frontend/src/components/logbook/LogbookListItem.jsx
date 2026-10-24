import { Link } from 'react-router-dom'
import { Check, ChevronRight } from 'lucide-react'
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
      <div className="relative shrink-0">
        <div
          className="size-14 rounded-[10px] md:size-[84px] md:rounded-xl"
          style={{ background: coverBackground(mountain.cover) }}
        />
        {verified && (
          <span
            role="img"
            aria-label="Terverifikasi"
            title="Terverifikasi"
            className="absolute -bottom-1 -right-1 flex size-[18px] items-center justify-center rounded-full bg-pine text-white ring-2 ring-paper md:-bottom-1.5 md:-right-1.5 md:size-6 md:ring-[3px]"
          >
            <Check size={11} strokeWidth={3.5} className="md:size-3.5" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[13.5px] font-bold md:text-base">{mountain.name}</h3>
        <p className="mt-0.5 text-[11px] text-mute md:mt-[5px] md:text-[12.5px]">
          Via {route}
          {!verified && ' · Ditambahkan manual'}
        </p>
        <p className="mt-[5px] text-[10.5px] text-mute md:mt-[3px] md:text-xs">
          {formatDateRange(startDate, endDate)}
          {duration && ` · ${duration}`}
          {repeat > 1 && ` · Didaki ${repeat}×`}
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