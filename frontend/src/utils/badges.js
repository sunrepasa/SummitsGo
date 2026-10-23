import { TIER_NAMES, badgeCatalog } from '../data/badgeCatalog'

// mengembalikan hanya lencana yang sudah didapat, masing-masing di tingkat tertingginya
export function getEarnedBadges(stats) {
  return badgeCatalog.flatMap((badge) => {
    const value = badge.metric(stats)
    const reached = badge.tiers.filter((t) => value >= t.min)
    if (reached.length === 0) return []

    const current = reached[reached.length - 1]
    const next = badge.tiers[reached.length]

    return [
      {
        id: badge.id,
        name: badge.name,
        icon: badge.icon,
        image: current.image ?? badge.image,
        tier: current.tier,
        tierName: current.tierName ?? TIER_NAMES[current.tier],
        label: current.label,
        description: badge.describe(current.min),
        valueText: badge.format(value),
        tierCount: badge.tiers.length,
        next: next && { tierName: next.tierName ?? TIER_NAMES[next.tier], description: badge.describe(next.min) },
      },
    ]
  })
}