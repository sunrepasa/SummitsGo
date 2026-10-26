import { Link } from 'react-router-dom'
import { CalendarDays, Link2 } from 'lucide-react'
import Avatar from '../ui/Avatar'
import ProfileBadges from './ProfileBadges'
import ProfileLinks from './ProfileLinks'
import { formatMonthYear } from '../../utils/date'
import { profileOf } from '../../utils/profile'

function Stat({ value, label }) {
  return (
    <div className="rounded-xl bg-stone p-2.5 text-center md:rounded-[13px] md:px-1.5 md:py-3">
      <b className="block font-heading text-base md:text-xl">{value}</b>
      <span className="text-[10px] text-mute md:text-[11px]">{label}</span>
    </div>
  )
}

// onEdit: tampilan pemilik (tombol Edit + tautan profil publik); onShare: tampilan pengunjung
export default function ProfileCard({ user, stats, onEdit, onShare }) {
  const publicPath = `/u/${user.username}`
  const profile = profileOf(user)
  const { bio, display } = profile
  const joined = display.joinedSince && user.joinedAt ? formatMonthYear(user.joinedAt) : ''
  const value = (n) => (stats ? n : '–')

  return (
    <section className="rounded-[18px] border border-line bg-paper p-4 md:rounded-[20px] md:px-6 md:py-[26px] md:text-center">
      <div className="flex items-center gap-3 md:flex-col md:gap-0">
        <span className="md:hidden">
          <Avatar name={user.name} size={58} />
        </span>
        <span className="hidden md:mb-3.5 md:block">
          <Avatar name={user.name} size={92} />
        </span>

        <div className="min-w-0 flex-1 md:flex-none md:self-stretch">
          <h2 className="truncate font-heading text-[15.5px] font-bold md:text-xl">{user.name}</h2>
          <p className="text-[11px] text-mute md:mt-0.5 md:text-[13px]">@{user.username}</p>
          {onEdit && (
            <Link
              to={publicPath}
              className="mt-1 flex items-center gap-1 text-[10.5px] font-semibold text-leaf-deep md:mt-2.5 md:justify-center md:text-xs"
            >
              <Link2 size={11} className="shrink-0" />
              <span className="truncate">
                {window.location.host}
                {publicPath}
              </span>
            </Link>
          )}
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="self-start rounded-full bg-[#E7F0E1] px-[11px] py-[7px] text-[11px] font-semibold text-pine-deep md:mt-4 md:w-full md:self-stretch md:rounded-[11px] md:border md:border-line md:bg-paper md:px-[18px] md:py-2.5 md:text-[13px] md:text-ink md:hover:bg-stone"
          >
            Edit<span className="hidden md:inline"> Profil</span>
          </button>
        )}
        {!onEdit && onShare && (
          <button
            type="button"
            onClick={onShare}
            className="mt-4 hidden w-full items-center justify-center gap-2 rounded-[11px] border border-line bg-paper px-[18px] py-2.5 text-[13px] font-semibold hover:bg-stone md:flex"
          >
            <Link2 size={14} />
            Bagikan Profil
          </button>
        )}
      </div>

      {bio && (
        <p className="mt-3 line-clamp-3 whitespace-pre-line break-words text-center text-[12.5px] leading-relaxed md:text-[13px]">
          {bio}
        </p>
      )}

      <ProfileLinks profile={profile} />

      <ProfileBadges stats={stats} shown={display.shownBadges} />

      {joined && (
        <p className="mt-3 flex items-center justify-center gap-1 text-[11px] text-mute">
          <CalendarDays size={12} />
          Bergabung sejak {joined}
        </p>
      )}

      <div className="mt-3.5 grid grid-cols-2 gap-2.5 md:mt-5 md:border-t md:border-line md:pt-5">
        <Stat value={value(stats?.climbed)} label="Gunung Didaki" />
        <Stat
          value={stats ? `${stats.highest.toLocaleString('id-ID')} m` : '–'}
          label="Tertinggi Dicapai"
        />
        {display.extraStats && (
          <>
            <Stat value={value(stats?.trips)} label="Total Pendakian" />
            <Stat value={value(stats?.days)} label="Hari di Gunung" />
          </>
        )}
      </div>
    </section>
  )
}