import { Link } from 'react-router-dom'

// layar penuh untuk entri/profil yang tidak bisa ditampilkan (privat, dihapus, tidak ditemukan, gagal dimuat)
export default function StateScreen({ icon: Icon, title, text, action }) {
  return (
    <div className="px-[30px] py-24 text-center text-mute md:py-32">
      <Icon size={46} strokeWidth={1.5} className="mx-auto mb-3.5" />
      <h1 className="mb-1.5 font-heading text-base text-ink md:text-xl">{title}</h1>
      <p className="mb-5 text-xs leading-normal md:text-[13.5px]">{text}</p>
      {action ?? (
        <Link to="/" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
          Ke Beranda
        </Link>
      )}
    </div>
  )
}
