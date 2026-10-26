import { useState } from 'react'
import { ChevronDown, ExternalLink, MessageCircle, Phone } from 'lucide-react'
import Section from './Section'
import { facilityIcon } from './facilityMeta'
import Badge from '../../ui/Badge'
import { difficultyLabel, difficultyVariant } from '../../../utils/mountainLabels'
import { facilityLabel, formatPrice, telUrl, whatsappUrl } from '../../../utils/mountainDetail'

const contactBtn =
  'flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-[#E7F0E1] py-[9px] text-xs font-semibold text-pine-deep md:flex-none md:px-[18px] md:text-[12.5px]'

function Basecamp({ basecamp: b }) {
  return (
    <div className="mb-3 rounded-xl border border-line bg-stone p-3 md:mb-3.5 md:rounded-[13px] md:px-4 md:py-3.5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <b className="text-[12.5px] md:text-sm">{b.name}</b>
        {b.price != null && (
          <span className="whitespace-nowrap text-xs font-semibold text-leaf-deep md:text-[13.5px]">
            {formatPrice(b.price)}
          </span>
        )}
      </div>
      <p className="text-[11.5px] leading-normal text-mute md:text-[12.5px]">
        {b.address}{' '}
        {b.mapsUrl && (
          <a
            href={b.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 font-semibold text-leaf-deep"
          >
            Lihat lokasi
            <ExternalLink size={11} />
          </a>
        )}
      </p>
      {(b.whatsapp || b.phone) && (
        <div className="mt-2.5 flex gap-2 md:mt-3 md:gap-2.5">
          {b.whatsapp && (
            <a href={whatsappUrl(b.whatsapp)} target="_blank" rel="noreferrer" className={contactBtn}>
              <MessageCircle size={14} />
              WhatsApp
            </a>
          )}
          {b.phone && (
            <a href={telUrl(b.phone)} className={contactBtn}>
              <Phone size={14} />
              Telepon
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function PostList({ posts }) {
  if (posts.length === 0) {
    return <p className="text-[11.5px] text-mute md:text-xs">Data pos untuk jalur ini belum tersedia.</p>
  }

  return (
    <>
      <p className="mb-0.5 text-[11px] font-semibold text-mute md:text-xs">Pos</p>
      {posts.map((p) => (
        <div
          key={p.name}
          className="flex items-center justify-between gap-2 border-t border-dashed border-line py-2 text-[11.5px] md:py-2.5 md:text-[12.5px]"
        >
          <span className="flex flex-wrap items-center gap-1.5">
            <b className="text-xs font-semibold md:text-[13px]">{p.name}</b>
            {p.facilities.map((f) => {
              const Icon = facilityIcon[f]
              const warn = f === 'blankspot' || f === 'danger'
              return (
                <span
                  key={f}
                  title={facilityLabel[f]}
                  role="img"
                  aria-label={facilityLabel[f]}
                  className={warn ? 'text-warn' : 'text-leaf-deep'}
                >
                  <Icon size={14} />
                </span>
              )
            })}
          </span>
          <span className="whitespace-nowrap text-mute">
            {p.distance} · {p.duration}
          </span>
        </div>
      ))}
    </>
  )
}

function RouteAccordion({ route, open, onToggle }) {
  const bodyId = `route-${route.name}`

  return (
    <div className="mb-2 overflow-hidden rounded-xl border border-line last:mb-0 md:mb-2.5 md:rounded-[14px]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center justify-between bg-paper px-3.5 py-3 text-left text-[13px] font-semibold md:px-[18px] md:py-[15px] md:text-[14.5px]"
      >
        <span>
          Via {route.name}
          {route.posts.length > 0 && (
            <span className="ml-1 text-[11px] font-normal text-mute md:text-xs">
              · {route.posts.length} pos
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`text-mute transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id={bodyId} className="bg-paper px-3.5 pb-3.5 pt-0.5 md:px-[18px] md:pb-[18px] md:pt-1">
          <div className="mb-2 flex flex-wrap gap-1.5 md:mb-2.5">
            <Badge variant={difficultyVariant[route.difficulty]}>{difficultyLabel[route.difficulty]}</Badge>
            {route.duration && <Badge variant="muted">{route.duration}</Badge>}
          </div>
          {route.description && (
            <p className="mb-3 text-xs leading-normal text-[#3A4640] md:mb-3.5 md:text-[13px]">
              {route.description}
            </p>
          )}
          {route.basecamp && <Basecamp basecamp={route.basecamp} />}
          <PostList posts={route.posts} />
        </div>
      )}
    </div>
  )
}

export default function RoutesSection({ routes }) {
  // jalur pertama terbuka sejak awal, sisanya tertutup
  const [openNames, setOpenNames] = useState(() => new Set(routes.slice(0, 1).map((r) => r.name)))

  if (routes.length === 0) return null

  const toggle = (name) =>
    setOpenNames((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })

  return (
    <Section title="Jalur & Pos">
      {routes.map((r) => (
        <RouteAccordion key={r.name} route={r} open={openNames.has(r.name)} onToggle={() => toggle(r.name)} />
      ))}
    </Section>
  )
}
