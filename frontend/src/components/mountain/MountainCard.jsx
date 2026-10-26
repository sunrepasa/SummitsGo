import { Link } from 'react-router-dom'
import Badge from '../ui/Badge'
import {
  coverBackground,
  difficultyLabel,
  difficultyVariant,
  formatElevation,
  statusLabel,
  statusVariant,
} from '../../utils/mountainLabels'

export default function MountainCard({ mountain: m, isNew = false, fitTag = false }) {
  return (
    <Link
      to={`/mountain/${m.id}`}
      className="block w-[150px] shrink-0 md:w-auto md:overflow-hidden md:rounded-2xl md:border md:border-line md:bg-paper md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg"
    >
      <div
        className="relative flex h-[110px] items-end rounded-[14px] p-2 md:h-[140px] md:rounded-none md:p-2.5"
        style={{ background: coverBackground(m.cover) }}
      >
        {isNew && (
          <span className="absolute left-2 top-2 rounded-md bg-leaf px-[7px] py-0.5 text-[9.5px] font-bold text-[#12210F] md:left-2.5 md:top-2.5 md:px-2 md:py-[3px] md:text-[10px]">
            Baru
          </span>
        )}
        <span className="rounded-full bg-[rgba(20,30,25,.55)] px-2 py-[3px] text-[10.5px] text-white backdrop-blur-[2px] md:px-[9px] md:text-[11px] md:font-medium">
          {formatElevation(m.elevation)}
        </span>
      </div>

      <div className="pt-2 md:px-[15px] md:pb-[15px] md:pt-[13px]">
        <h3 className="text-[13.5px] font-semibold leading-tight md:text-[15px] md:font-bold">{m.name}</h3>
        <p className="mt-0.5 text-[11.5px] text-mute md:text-xs">
          {m.location}
          <span className="md:hidden"> · {difficultyLabel[m.difficulty]}</span>
        </p>

        <div className="mt-1.5 flex flex-wrap gap-1.5 md:mt-2.5">
          <span className="hidden md:inline-flex">
            <Badge variant={difficultyVariant[m.difficulty]}>{difficultyLabel[m.difficulty]}</Badge>
          </span>
          {fitTag && <Badge>Cocok pemula</Badge>}
          {m.status !== 'open' && (
            <span className="hidden md:inline-flex">
              <Badge variant={statusVariant[m.status]}>{statusLabel[m.status]}</Badge>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function MountainCardSkeleton() {
  return (
    <div className="w-[150px] shrink-0 animate-pulse md:w-auto">
      <div className="h-[110px] rounded-[14px] bg-line md:h-[140px]" />
      <div className="mt-2 h-3.5 w-3/4 rounded bg-line" />
      <div className="mt-1.5 h-3 w-1/2 rounded bg-line" />
    </div>
  )
}