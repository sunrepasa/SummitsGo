import { useState } from 'react'
import {
  Award,
  Bell,
  BellRing,
  CalendarClock,
  Heart,
  MailPlus,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BackTopBar from '../../components/layout/BackTopBar'
import GuestPrompt from '../../components/auth/GuestPrompt'
import NotificationsMenu from '../../components/notifications/NotificationsMenu'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  deleteAllNotifications,
  deleteNotification,
  deleteReadNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../api/notifications'
import { useAsync } from '../../hooks/useAsync'
import { formatTimeAgo } from '../../utils/notifications'

const kinds = {
  checklist_invite: { icon: MailPlus, tone: 'bg-[#E3EEE6] text-leaf-deep' },
  member_joined: { icon: UserPlus, tone: 'bg-[#E3EEE6] text-leaf-deep' },
  badge_earned: { icon: Award, tone: 'bg-[#FBEFD9] text-[#8A6417]' },
  trip_verified: { icon: ShieldCheck, tone: 'bg-[#E6F1E4] text-ok' },
  entry_liked: { icon: Heart, tone: 'bg-warnbg text-warn' },
  plan_reminder: { icon: CalendarClock, tone: 'bg-stone text-mute' },
}

function Row({ item, onOpen, onDelete }) {
  const { icon: Icon, tone } = kinds[item.type] ?? { icon: BellRing, tone: 'bg-stone text-mute' }

  return (
    <li
      className={`flex items-start gap-1 rounded-[14px] border md:rounded-2xl md:transition md:hover:-translate-y-0.5 md:hover:shadow-lg ${
        item.read ? 'border-line bg-paper' : 'border-[#CFE0CC] bg-[#F4F8F1]'
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex min-w-0 flex-1 items-start gap-3 p-3 text-left md:gap-4 md:px-[18px] md:py-4"
      >
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full md:size-11 ${tone}`}>
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[13px] leading-snug md:text-sm ${item.read ? '' : 'font-semibold'}`}>
            {item.text}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-[10.5px] text-mute md:text-xs">
            {formatTimeAgo(item.createdAt)}
            {!item.read && <span aria-label="Belum dibaca" className="size-2 rounded-full bg-leaf-deep" />}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        aria-label="Hapus notifikasi"
        className="mr-1.5 mt-2.5 flex size-7 shrink-0 items-center justify-center rounded-full text-mute hover:bg-stone hover:text-warn md:mr-2 md:mt-3"
      >
        <X size={15} />
      </button>
    </li>
  )
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-start gap-3 rounded-[14px] border border-line bg-paper p-3 md:rounded-2xl md:p-4">
      <div className="size-10 shrink-0 rounded-full bg-line" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-4/5 rounded bg-line" />
        <div className="h-3 w-1/4 rounded bg-line" />
      </div>
    </div>
  )
}

const PAGE_SIZE = 10
const grid = 'grid gap-2.5 md:grid-cols-2 md:gap-3.5'

function NotificationsLoggedIn() {
  const navigate = useNavigate()
  const toast = useToast()
  const { data, error, loading, reload } = useAsync(getNotifications, [])
  const [showAll, setShowAll] = useState(false)
  const [confirm, setConfirm] = useState(null) // 'read' | 'all'
  const [busy, setBusy] = useState(false)

  const total = data?.length ?? 0
  const unread = data?.filter((n) => !n.read).length ?? 0
  const read = total - unread
  const visible = data && !showAll ? data.slice(0, PAGE_SIZE) : data

  const open = async (item) => {
    if (!item.read) await markNotificationRead(item.id).catch(() => {})
    navigate(item.to)
  }

  const markAll = async () => {
    await markAllNotificationsRead().catch(() => toast.error('Gagal menandai notifikasi. Coba lagi.'))
    reload()
  }

  const remove = async (item) => {
    try {
      await deleteNotification(item.id)
      toast.success('Notifikasi dihapus')
      reload()
    } catch {
      toast.error('Gagal menghapus notifikasi. Coba lagi.')
    }
  }

  const confirmDelete = async () => {
    setBusy(true)
    try {
      if (confirm === 'all') await deleteAllNotifications()
      else await deleteReadNotifications()
      toast.success(confirm === 'all' ? 'Semua notifikasi dihapus' : 'Notifikasi yang sudah dibaca dihapus')
      reload()
    } catch {
      toast.error('Gagal menghapus notifikasi. Coba lagi.')
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const menu = (
    <NotificationsMenu
      unread={unread}
      read={read}
      total={total}
      onMarkAll={markAll}
      onDeleteRead={() => setConfirm('read')}
      onDeleteAll={() => setConfirm('all')}
    />
  )

  let content
  if (error) {
    content = (
      <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">
        Gagal memuat notifikasi. Coba muat ulang halaman.
      </p>
    )
  } else if (loading) {
    content = (
      <div className={grid}>
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    )
  } else if (total === 0) {
    content = (
      <div className="px-[30px] py-[70px] text-center text-mute md:rounded-[18px] md:border md:border-dashed md:border-line md:bg-paper md:py-[100px]">
        <Bell size={38} strokeWidth={1.5} className="mx-auto mb-3" />
        <h3 className="mb-1.5 font-heading text-[15px] text-ink md:text-lg">Belum ada notifikasi</h3>
        <p className="text-xs md:text-[13px]">Undangan checklist dan kabar pendakianmu akan muncul di sini.</p>
      </div>
    )
  } else {
    content = (
      <>
        <ul className={grid}>
          {visible.map((n) => (
            <Row key={n.id} item={n} onOpen={open} onDelete={remove} />
          ))}
        </ul>
        {!showAll && total > PAGE_SIZE && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mx-auto mt-4 block rounded-full border border-line bg-paper px-6 py-2.5 text-[12.5px] font-semibold text-pine-deep md:text-[13px]"
          >
            Lihat semua ({total})
          </button>
        )}
      </>
    )
  }

  return (
    <>
      <BackTopBar onBack={() => navigate(-1)} title="Notifikasi" right={menu} />

      <div className="px-5 pb-6 pt-3.5 md:px-0 md:pb-0 md:pt-0">
        <div className="hidden items-center justify-between pb-[22px] pt-[30px] md:flex">
          <h1 className="font-heading text-[26px] font-bold">Notifikasi</h1>
          {menu}
        </div>
        {content}
      </div>

      {confirm && (
        <ConfirmDialog
          icon={Trash2}
          danger
          title={confirm === 'all' ? 'Hapus semua notifikasi?' : 'Hapus yang sudah dibaca?'}
          confirmLabel="Ya, Hapus"
          busy={busy}
          busyLabel="Menghapus..."
          onConfirm={confirmDelete}
          onCancel={() => setConfirm(null)}
        >
          {confirm === 'all'
            ? `Semua ${total} notifikasi dihapus dan tidak bisa dikembalikan.`
            : `${read} notifikasi yang sudah dibaca dihapus. Yang belum dibaca tetap ada.`}
        </ConfirmDialog>
      )}
    </>
  )
}

export default function Notifications() {
  const { isLoggedIn } = useAuth()
  if (isLoggedIn) return <NotificationsLoggedIn />
  return (
    <>
      <BackTopBar to="/" title="Notifikasi" />
      <GuestPrompt
        icon={Bell}
        title="Kamu belum masuk"
        description="Login untuk melihat undangan checklist, lencana baru, dan kabar pendakianmu."
      />
    </>
  )
}
