import { BadgeCheck } from 'lucide-react'
import { coverBackground } from '../../utils/mountainLabels'

export default function PublicEntryHero({ mountain, route, verified }) {
  return (
    <div className="md:pt-[22px]">
      <div
        className="relative h-[150px] md:mb-[22px] md:h-[230px] md:overflow-hidden md:rounded-[22px]"
        style={{ background: coverBackground(mountain.cover) }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.4),transparent_65%)]" />
        <div className="absolute bottom-3.5 left-5 right-5 text-white md:bottom-6 md:left-[30px]">
          {verified && (
            <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-[3px] text-[9.5px] font-semibold text-pine-deep md:mb-2.5 md:px-[11px] md:py-1 md:text-[11px]">
              <BadgeCheck size={11} />
              Terverifikasi
            </span>
          )}
          <h1 className="font-heading text-[19px] font-bold md:text-[32px]">{mountain.name}</h1>
          <p className="text-xs opacity-90 md:text-sm">Via {route}</p>
        </div>
      </div>
    </div>
  )
}
