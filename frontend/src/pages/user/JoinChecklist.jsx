import { useState } from 'react'
import { CalendarDays, Link2Off, TriangleAlert, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import AvatarStack from '../../components/ui/AvatarStack'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { getInviteByCode, joinByInviteCode } from '../../api/checklist'
import { useAsync } from '../../hooks/useAsync'
import { formatDateRange } from '../../utils/date'
import { coverBackground } from '../../utils/mountainLabels'

const primary = 'w-full rounded-xl bg-pine py-3 text-center text-[13.5px] font-semibold text-white disabled:opacity-60'

function Shell({ children }) {
  return (
    <>
      <BackTopBar to="/" title="Undangan Checklist" />
      <div className="mx-auto flex min-h-[70svh] max-w-[440px] flex-col justify-center px-5 py-8 md:min-h-[78svh]">
        {children}
      </div>
    </>
  )
}

function StateScreen({ icon: Icon, title, text, children }) {
  return (
    <Shell>
      <div className="text-center text-mute">
        <Icon size={42} strokeWidth={1.5} className="mx-auto mb-3" />
        <h1 className="mb-1.5 font-heading text-base text-ink md:text-lg">{title}</h1>
        <p className="mb-5 text-xs md:text-[13px]">{text}</p>
        {children}
      </div>
    </Shell>
  )
}

function Skeleton() {
  return (
    <Shell>
      <div className="animate-pulse space-y-3" aria-busy="true" aria-label="Memuat undangan">
        <div className="h-[130px] rounded-2xl bg-line" />
        <div className="h-5 w-2/3 rounded bg-line" />
        <div className="h-4 w-1/2 rounded bg-line" />
        <div className="h-11 rounded-xl bg-line" />
      </div>
    </Shell>
  )
}

export default function JoinChecklist() {
  const { code } = useParams()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const { data, error, loading, reload } = useAsync(() => getInviteByCode(code), [code])
  const [joining, setJoining] = useState(false)

  if (loading) return <Skeleton />

  if (error) {
    return error.code === 'NOT_FOUND' || error.status === 404 ? (
      <StateScreen
        icon={Link2Off}
        title="Undangan tidak valid"
        text="Tautan ini salah, sudah dihapus, atau checklist-nya sudah tidak ada."
      >
        <Link to="/" className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white">
          Ke Beranda
        </Link>
      </StateScreen>
    ) : (
      <StateScreen icon={TriangleAlert} title="Gagal memuat undangan" text="Periksa koneksi lalu coba lagi.">
        <button
          type="button"
          onClick={reload}
          className="rounded-full bg-pine px-5 py-2.5 text-[13px] font-semibold text-white"
        >
          Coba Lagi
        </button>
      </StateScreen>
    )
  }

  const joined = isLoggedIn && data.joined
  const plan = data.plannedDate ? `Rencana ${formatDateRange(data.plannedDate)}` : 'Belum ada tanggal'

  // guest diarahkan masuk dulu, lalu kembali ke halaman ini untuk menekan "Gabung Checklist"
  const join = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/join/${code}` } })
      return
    }
    setJoining(true)
    try {
      const checklistId = await joinByInviteCode(code)
      toast.success('Kamu bergabung ke checklist')
      navigate(`/checklist/${checklistId}`, { replace: true })
    } catch {
      toast.error('Gagal bergabung. Coba lagi.')
      setJoining(false)
    }
  }

  return (
    <Shell>
      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        <div className="h-[120px]" style={{ background: coverBackground(data.mountain.cover) }} />
        <div className="p-5">
          <p className="mb-1 text-[11.5px] text-mute">
            <b className="text-ink">{data.invitedBy}</b> mengundangmu ke checklist
          </p>
          <h1 className="font-heading text-xl font-bold">{data.mountain.name}</h1>
          <p className="mt-0.5 text-[12.5px] text-mute">Via {data.route}</p>

          <div className="mt-4 space-y-2 text-[12.5px] text-mute">
            <p className="flex items-center gap-2">
              <CalendarDays size={15} className="shrink-0" />
              {plan}
            </p>
            <p className="flex items-center gap-2">
              <Users size={15} className="shrink-0" />
              <AvatarStack names={data.members} size={22} />
              <span>{data.members.length} anggota sudah bergabung</span>
            </p>
          </div>

          <div className="mt-5">
            {joined ? (
              <Link to={`/checklist/${data.checklistId}`} className={`block ${primary}`}>
                Buka Checklist
              </Link>
            ) : (
              <button type="button" onClick={join} disabled={joining} className={primary}>
                {joining ? 'Menggabungkan…' : 'Gabung Checklist'}
              </button>
            )}
            {!isLoggedIn && (
              <p className="mt-2.5 text-center text-[11px] text-mute">Kamu perlu masuk dulu untuk bergabung.</p>
            )}
          </div>
        </div>
      </div>
    </Shell>
  )
}
