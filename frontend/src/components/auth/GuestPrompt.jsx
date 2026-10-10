import { Link } from 'react-router-dom'

export default function GuestPrompt({ icon: Icon, title, description, perks = [] }) {
  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center px-[30px] py-12 text-center">
      <span className="mb-[18px] flex size-[76px] items-center justify-center rounded-full bg-[#E7F0E1] text-pine">
        <Icon size={32} strokeWidth={1.75} />
      </span>

      <h2 className="mb-2 font-heading text-[17px] font-bold">{title}</h2>
      <p className="mb-6 max-w-[260px] text-[12.5px] leading-[1.6] text-mute">{description}</p>

      <Link
        to="/login"
        className="mb-2.5 w-full max-w-[240px] rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white"
      >
        Masuk
      </Link>
      <Link
        to="/register"
        className="w-full max-w-[240px] rounded-xl border border-line bg-paper py-[11px] text-[13px] font-semibold"
      >
        Daftar Akun Baru
      </Link>

      {perks.length > 0 && (
        <ul className="mt-7 flex gap-[18px]">
          {perks.map(({ icon: PerkIcon, label }) => (
            <li key={label} className="w-[76px]">
              <PerkIcon size={20} className="mx-auto mb-1.5 text-leaf-deep" />
              <span className="block text-[9.5px] leading-[1.3] text-mute">{label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}