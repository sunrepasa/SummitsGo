import { ArrowLeft, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import EntryMenu from './EntryMenu'
import { coverBackground } from '../../../utils/mountainLabels'

export default function LogbookHero({ entry, onEditNote, onShare, onDelete }) {
  const { mountain, route, verified } = entry

  return (
    <div className="md:pt-[22px]">
      <Link
        to="/logbook"
        className="mb-4 hidden items-center gap-1.5 text-[13px] font-semibold text-mute hover:text-ink md:inline-flex"
      >
        <ArrowLeft size={14} />
        Logbook
      </Link>

      <div
        className="relative h-[150px] md:mb-[22px] md:h-[230px] md:overflow-hidden md:rounded-[22px]"
        style={{ background: coverBackground(mountain.cover) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.4),transparent_65%)]" />

        <Link
          to="/logbook"
          aria-label="Kembali ke Logbook"
          className="absolute left-4 top-4 flex size-[34px] items-center justify-center rounded-full bg-black/35 text-white md:hidden"
        >
          <ArrowLeft size={16} />
        </Link>
        <EntryMenu onEditNote={onEditNote} onShare={onShare} onDelete={onDelete} />

        <div className="absolute bottom-3.5 left-5 right-5 text-white md:bottom-6 md:left-[30px]">
          {verified && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-[3px] text-[9.5px] font-semibold text-pine-deep md:mb-2.5 md:px-[11px] md:py-1 md:text-[11px]">
              <BadgeCheck size={11} />
              Terverifikasi
            </span>
          )}
          <h1 className="font-heading text-[19px] font-bold md:text-[32px]">{mountain.name}</h1>
          <p className="text-xs opacity-90 md:text-sm">
            Via {route}
            {!verified && ' · Ditambahkan manual'}
          </p>
        </div>
      </div>
    </div>
  )
}
