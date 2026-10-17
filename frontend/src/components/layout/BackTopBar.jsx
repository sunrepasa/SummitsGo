import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import TopBar from './TopBar'

// bilah atas mobile dengan tombol kembali; di desktop halaman memakai tautan kembali sendiri
export default function BackTopBar({ to, title }) {
  return (
    <TopBar>
      <div className="flex items-center gap-2.5">
        <Link
          to={to}
          aria-label="Kembali"
          className="flex size-8 items-center justify-center rounded-full border border-line bg-paper"
        >
          <ArrowLeft size={15} />
        </Link>
        <h1 className="font-heading text-[17px] font-bold">{title}</h1>
      </div>
    </TopBar>
  )
}
