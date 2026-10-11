import Badge from '../ui/Badge'
import { getBadges } from '../../utils/badges'

export default function ProfileBadges({ stats, show }) {
  if (!show || !stats) return null
  const badges = getBadges(stats)
  if (badges.length === 0) return null

  return (
    <ul className="mt-3.5 flex flex-wrap gap-1.5 md:justify-center">
      {badges.map(({ id, label, icon: Icon }) => (
        <li key={id}>
          <Badge variant="gold">
            <Icon size={11} />
            {label}
          </Badge>
        </li>
      ))}
    </ul>
  )
}