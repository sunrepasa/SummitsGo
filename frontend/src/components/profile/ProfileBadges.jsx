import { useState } from 'react'
import BadgeMedal from '../ui/BadgeMedal'
import BadgePopover from './BadgePopover'
import { getEarnedBadges, selectDisplayedBadges } from '../../utils/badges'
import { popoverPosition } from '../../utils/popoverPosition'

export default function ProfileBadges({ stats, shown = null }) {
  const [active, setActive] = useState(null)
  if (!stats) return null

  const badges = selectDisplayedBadges(getEarnedBadges(stats), shown)
  if (badges.length === 0) return null

  const toggle = (badge) => (e) => {
    const next = { badge, position: popoverPosition(e.currentTarget.getBoundingClientRect()) }
    setActive((current) => (current?.badge.id === badge.id ? null : next))
  }

  return (
    <>
      <ul className="mt-2.5 flex flex-wrap justify-center gap-1.5">
        {badges.map((b) => (
          <li key={b.id}>
            <button
              type="button"
              data-badge-trigger
              onClick={toggle(b)}
              title={b.name}
              aria-haspopup="dialog"
              aria-expanded={active?.badge.id === b.id}
              aria-label={b.tierName ? `${b.name}, tingkat ${b.tierName}` : b.name}
              className="block rounded-full transition hover:-translate-y-0.5"
            >
              <BadgeMedal image={b.image} size={44} />
            </button>
          </li>
        ))}
      </ul>

      {active && (
        <BadgePopover badge={active.badge} position={active.position} onClose={() => setActive(null)} />
      )}
    </>
  )
}