import { Download, Map as MapIcon, MapPinned } from 'lucide-react'
import Section from './Section'

const btn = 'flex w-full items-center justify-center gap-1.5 rounded-xl font-semibold'
const off = 'pointer-events-none bg-[#E3E7E0] text-[#9AA59E]'

// dirender dua kali oleh halaman (mobile di tengah alur, desktop di sidebar); state-nya dipegang halaman
export default function MapCard({ routes, activeRoute, onSelectRoute, onDownload, onLive, className = '' }) {
  const available = Boolean(activeRoute?.mapAvailable)

  return (
    <Section title="Peta & Live Location" className={className}>
      {routes.length > 0 && (
        <div className="mb-2.5 flex flex-wrap gap-2 md:mb-3">
          {routes.map((r) => {
            const active = r.name === activeRoute?.name
            return (
              <button
                key={r.name}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectRoute(r.name)}
                className={`rounded-full border px-3 py-1.5 text-[11.5px] md:px-3.5 md:py-[7px] md:text-xs ${
                  active ? 'border-pine bg-pine text-white' : 'border-line bg-paper text-ink'
                }`}
              >
                Via {r.name}
              </button>
            )
          })}
        </div>
      )}

      {available ? (
        <div className="mb-2.5 flex h-[120px] items-center justify-center rounded-[14px] bg-[linear-gradient(0deg,rgba(20,40,30,.15),rgba(20,40,30,.15)),repeating-linear-gradient(45deg,#CFE0C9_0_8px,#C3D8BC_8px_16px)] text-pine md:mb-3 md:h-[150px]">
          <MapIcon size={28} />
        </div>
      ) : (
        <div className="mb-2.5 flex h-[120px] flex-col items-center justify-center gap-1 rounded-[14px] border-[1.5px] border-dashed border-line bg-[#E9ECE6] text-center text-mute md:mb-3 md:h-[150px]">
          <MapIcon size={28} />
          <small className="px-3 text-[11.5px] font-medium md:text-xs">
            {routes.length === 0 ? 'Peta belum tersedia untuk gunung ini' : 'Peta jalur ini belum tersedia'}
          </small>
        </div>
      )}

      <button
        type="button"
        disabled={!available}
        onClick={onDownload}
        className={`${btn} py-[11px] text-[13px] md:py-3 md:text-[13.5px] ${available ? 'bg-leaf text-[#12210F]' : off}`}
      >
        <Download size={15} />
        Unduh Peta{activeRoute ? ` — Jalur ${activeRoute.name}` : ''}
      </button>
      <button
        type="button"
        disabled={!available}
        onClick={onLive}
        className={`${btn} mt-2 py-[9px] text-[12.5px] md:mt-[9px] md:py-[11px] md:text-[13px] ${available ? 'bg-[#E7F0E1] text-pine-deep' : off}`}
      >
        <MapPinned size={15} />
        Buka Live Location
      </button>
    </Section>
  )
}
