import { Globe } from 'lucide-react'
import { InstagramIcon, TikTokIcon } from '../ui/SocialIcons'
import { SOCIAL_MAX, safeWebsite, validateHandle, websiteHost } from '../../utils/profile'

// tiap tautan diperiksa ulang di sini, jadi data yang rusak atau dimanipulasi tidak ikut dirender
function buildLinks({ socials, display }) {
  const links = []

  if (display.tiktok && socials.tiktok && !validateHandle(socials.tiktok, SOCIAL_MAX.tiktok)) {
    links.push({
      id: 'tiktok',
      label: `TikTok @${socials.tiktok}`,
      href: `https://www.tiktok.com/@${socials.tiktok}`,
      Icon: TikTokIcon,
    })
  }

  if (
    display.instagram &&
    socials.instagram &&
    !validateHandle(socials.instagram, SOCIAL_MAX.instagram)
  ) {
    links.push({
      id: 'instagram',
      label: `Instagram @${socials.instagram}`,
      href: `https://www.instagram.com/${socials.instagram}`,
      Icon: InstagramIcon,
    })
  }

  const site = safeWebsite(socials.website)
  if (display.website && site) {
    links.push({ id: 'website', label: `Situs web: ${websiteHost(site)}`, href: site, Icon: Globe })
  }

  return links
}

export default function ProfileLinks({ profile }) {
  const links = buildLinks(profile)
  if (links.length === 0) return null

  return (
    <ul className="mt-3 flex gap-2 md:justify-center">
      {links.map(({ id, label, href, Icon }) => (
        <li key={id}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            title={label}
            aria-label={label}
            className="flex size-8 items-center justify-center rounded-full border border-line bg-stone text-mute transition hover:bg-[#E7F0E1] hover:text-pine"
          >
            <Icon size={16} />
          </a>
        </li>
      ))}
    </ul>
  )
}