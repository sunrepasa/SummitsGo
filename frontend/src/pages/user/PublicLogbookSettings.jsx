import { ArrowLeft } from 'lucide-react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import PublicLogbookList from '../../components/settings/PublicLogbookList'
import { useAuth } from '../../context/AuthContext'

const INTRO =
  'Entri yang diaktifkan tampil di profil publikmu dan bisa dibuka lewat tautan. Entri yang tidak diaktifkan tetap privat.'

export default function PublicLogbookSettings() {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) return <Navigate to="/login" state={{ from: location.pathname }} replace />

  return (
    <>
      <BackTopBar to="/settings" title="Logbook Ditampilkan Publik" />

      <div className="px-5 pb-8 pt-3 md:px-0 md:pb-12 md:pt-7">
        <Link
          to="/settings"
          className="mb-4 hidden items-center gap-1.5 text-[13px] font-semibold text-mute hover:text-ink md:inline-flex"
        >
          <ArrowLeft size={14} />
          Pengaturan &amp; Privasi
        </Link>
        <h1 className="mb-2 hidden font-heading text-[26px] font-bold md:block">Logbook Ditampilkan Publik</h1>
        <p className="mb-4 text-xs leading-normal text-mute md:mb-6 md:text-[13.5px]">{INTRO}</p>

        <PublicLogbookList columns={2} showDuration />
      </div>
    </>
  )
}
