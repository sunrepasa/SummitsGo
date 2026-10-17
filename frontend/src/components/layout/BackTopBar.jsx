import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from './TopBar'

const backClass = 'flex size-8 items-center justify-center rounded-full border border-line bg-paper'

// bilah atas mobile dengan tombol kembali; di desktop halaman memakai tautan kembali sendiri.
// `to` untuk tujuan tetap, `onBack` untuk kembali sesuai riwayat; `right` untuk aksi di kanan.
export default function BackTopBar({ to, onBack, title, right }) {
  return (
    <TopBar right={right}>
      <div className="flex items-center gap-2.5">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Kembali" className={backClass}>
            <ArrowLeft size={15} />
          </button>
        ) : (
          <Link to={to} aria-label="Kembali" className={backClass}>
            <ArrowLeft size={15} />
          </Link>
        )}
        <h1 className="font-heading text-[17px] font-bold">{title}</h1>
      </div>
    </TopBar>
  )
}
