import { Link } from 'react-router-dom'
import { Map as MapIcon, MapPin, Star } from 'lucide-react'
import Badge from '../ui/Badge'
import {
  coverBackground,
  difficultyLabel,
  difficultyVariant,
  formatElevation,
  statusLabel,
  statusVariant,
} from '../../utils/mountainLabels'

export default function MountainRow({ mountain: m, saved = false }) {
  return (
    <Link
      to={`/mountain/${m.id}`}
      className="flex gap-3 py-3 md:gap-[18px] md:rounded-2xl md:border md:border-line md:bg-paper md:p-3.5 md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg"
    >
      <div
        className="size-[76px] shrink-0 rounded-xl md:h-[104px] md:w-[150px]"
        style={{ background: coverBackground(m.cover) }}
      />

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <h3 className="text-[13.5px] font-bold md:text-[17px]">{m.name}</h3>
        <p className="mt-px flex items-center gap-1 text-[11px] text-mute md:mt-[3px] md:text-[12.5px]">
          <MapPin size={12} className="shrink-0" />
          {m.location} · {formatElevation(m.elevation)}
        </p>

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:mt-[11px] md:gap-2">
          <Badge variant={difficultyVariant[m.difficulty]}>{difficultyLabel[m.difficulty]}</Badge>
          <Badge variant={statusVariant[m.status]}>{statusLabel[m.status]}</Badge>
          <span className="flex items-center gap-1 text-[10.5px] text-mute md:text-[12.5px]">
            <Star size={12} className="fill-[#E0A93B] text-[#E0A93B]" />
            <b className="font-semibold text-ink">{m.rating.toFixed(1)}</b>({m.reviewCount})
          </span>
        </div>

        {saved && (
          <p className="mt-[5px] flex items-center gap-[3px] text-[9.5px] font-semibold text-leaf-deep md:mt-[9px] md:text-[11.5px]">
            <MapIcon size={11} />
            Peta sudah diunduh
          </p>
        )}
      </div>
    </Link>
  )
}

export function MountainRowSkeleton() {
  return (
    <div className="flex animate-pulse gap-3 py-3 md:gap-[18px] md:rounded-2xl md:border md:border-line md:bg-paper md:p-3.5">
      <div className="size-[76px] shrink-0 rounded-xl bg-line md:h-[104px] md:w-[150px]" />
      <div className="flex-1 space-y-2 pt-1.5">
        <div className="h-3.5 w-1/2 rounded bg-line" />
        <div className="h-3 w-2/3 rounded bg-line" />
        <div className="h-3 w-1/3 rounded bg-line" />
      </div>
    </div>
  )
}