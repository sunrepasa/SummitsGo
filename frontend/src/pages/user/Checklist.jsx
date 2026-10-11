import { Backpack, Plus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import ChecklistCard, { ChecklistCardSkeleton } from '../../components/checklist/ChecklistCard'
import { useAuth } from '../../context/AuthContext'
import { getMyChecklists } from '../../api/checklist'
import { useAsync } from '../../hooks/useAsync'

const grid = 'grid gap-3 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] md:gap-[18px]'
const LOGIN_STATE = { from: '/checklist' }

function PillButton({ onClick, className = '', children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1 rounded-full bg-pine font-semibold text-white ${className}`}
    >
      {children}
    </button>
  )
}

function EmptyState({ onCreate, children }) {
  return (
    <div className="px-[30px] py-[70px] text-center text-mute md:rounded-[18px] md:border md:border-dashed md:border-line md:bg-paper md:py-[100px]">
      <Backpack size={38} strokeWidth={1.5} className="mx-auto mb-3" />
      <h3 className="mb-1.5 font-heading text-[15px] text-ink md:text-lg">Belum ada checklist</h3>
      <p className="mb-4 text-xs leading-normal md:mb-5 md:text-[13px] md:leading-relaxed">
        Yuk siapin daftar bawaan buat
        <br />
        pendakian pertamamu.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="rounded-full bg-pine px-5 py-2.5 text-[12.5px] font-semibold text-white md:px-[22px] md:py-[11px] md:text-[13px]"
      >
        Buat Checklist Baru
      </button>
      {children}
    </div>
  )
}

function ChecklistView({ onCreate, showCreate = false, children }) {
  return (
    <>
      <TopBar
        title="Checklist Saya"
        right={
          <PillButton onClick={onCreate} className="px-[13px] py-2 text-[11.5px]">
            <Plus size={14} />
            Baru
          </PillButton>
        }
      />

      <div className="px-5 pb-6 pt-3.5 md:px-0 md:pb-0 md:pt-0">
        <div className="hidden items-center justify-between pb-[22px] pt-[30px] md:flex">
          <h1 className="font-heading text-[26px] font-bold">Checklist Saya</h1>
          {showCreate && (
            <PillButton onClick={onCreate} className="px-[22px] py-[11px] text-[13px]">
              <Plus size={15} />
              Buat Checklist Baru
            </PillButton>
          )}
        </div>
        {children}
      </div>
    </>
  )
}

// onCreate belum diisi untuk user login: form Buat Checklist Baru dibuat di langkah berikutnya
function ChecklistLoggedIn() {
  const { data, error, loading } = useAsync(getMyChecklists, [])

  let body
  if (error) {
    body = (
      <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">
        Gagal memuat checklist. Coba muat ulang halaman.
      </p>
    )
  } else if (loading) {
    body = (
      <div className={grid}>
        {Array.from({ length: 3 }, (_, i) => (
          <ChecklistCardSkeleton key={i} />
        ))}
      </div>
    )
  } else if (data.length === 0) {
    body = <EmptyState />
  } else {
    body = (
      <div className={grid}>
        {data.map((c) => (
          <ChecklistCard key={c.id} checklist={c} />
        ))}
      </div>
    )
  }

  return <ChecklistView showCreate={Boolean(data?.length)}>{body}</ChecklistView>
}

// guest tidak memanggil API sama sekali: endpoint checklist butuh token, dan datanya memang kosong
function ChecklistGuest() {
  const navigate = useNavigate()
  const toLogin = () => navigate('/login', { state: LOGIN_STATE })

  return (
    <ChecklistView onCreate={toLogin}>
      <EmptyState onCreate={toLogin}>
        <Link
          to="/login"
          state={LOGIN_STATE}
          className="mt-4 block text-[12.5px] font-semibold text-leaf-deep"
        >
          Masuk untuk menyimpan checklist-mu
        </Link>
      </EmptyState>
    </ChecklistView>
  )
}

export default function Checklist() {
  const { isLoggedIn } = useAuth()
  return isLoggedIn ? <ChecklistLoggedIn /> : <ChecklistGuest />
}