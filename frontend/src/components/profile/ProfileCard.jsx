import { Link } from 'react-router-dom'
import { Link2 } from 'lucide-react'
import Avatar from '../ui/Avatar'

function Stat({ value, label }) {
  return (
    <div className="flex-1 rounded-xl bg-stone p-2.5 text-center md:rounded-[13px] md:px-1.5 md:py-3">
      <b className="block font-heading text-base md:text-xl">{value}</b>
      <span className="text-[10px] text-mute md:text-[11px]">{label}</span>
    </div>
  )
}

export default function ProfileCard({ user, stats }) {
  const publicPath = `/u/${user.username}`

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
        </div>

        <button
          type="button"
          className="self-start rounded-full bg-[#E7F0E1] px-[11px] py-[7px] text-[11px] font-semibold text-pine-deep md:mt-4 md:w-full md:self-stretch md:rounded-[11px] md:border md:border-line md:bg-paper md:px-[18px] md:py-2.5 md:text-[13px] md:text-ink md:hover:bg-stone"
        >
          Edit<span className="hidden md:inline"> Profil</span>
        </button>
      </div>

      <div className="mt-3.5 flex gap-2.5 md:mt-5 md:border-t md:border-line md:pt-5">
        <Stat value={stats ? stats.climbed : '–'} label="Gunung Didaki" />
        <Stat
          value={stats ? `${stats.highest.toLocaleString('id-ID')} m` : '–'}
          label="Tertinggi Dicapai"
        />
      </div>
    </section>
  )
}