import { ArrowLeft, Crown, UserPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import AvatarStack from '../../ui/AvatarStack'
import Badge from '../../ui/Badge'
import ProgressBar from '../../ui/ProgressBar'
import { formatDateRange } from '../../../utils/date'

function RoleBadge({ role }) {
  return role === 'leader' ? (
    <Badge variant="gold" className="md:px-[13px] md:py-[5px] md:text-[11.5px] md:font-bold">
      <Crown size={11} />
      Ketua
    </Badge>
  ) : (
    <Badge className="md:px-[13px] md:py-[5px] md:text-[11.5px] md:font-bold">Anggota</Badge>
  )
}

export default function DetailHeader({ checklist: c, progress, onShowMembers, onInvite }) {
  const { done, total } = progress
  const percent = total ? (done / total) * 100 : 0
  const plan = c.plannedDate ? `Rencana ${formatDateRange(c.plannedDate)}` : 'Belum ada tanggal'
  const progressText = total ? `${done}/${total} siap` : 'Belum ada barang'
  const isLeader = c.role === 'leader'
  const meName = c.members.find((m) => m.id === c.viewerId)?.name

  return (
    <>
      {/* Mobile: header menempel di atas */}
      <header className="sticky top-0 z-10 border-b border-line bg-stone px-5 pb-3.5 pt-4 md:hidden">
        <div className="flex items-center gap-2.5">
          <Link
            to="/checklist"
            aria-label="Kembali ke Checklist Saya"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-paper"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-heading text-base font-bold">Checklist — {c.mountain.name}</h1>
            <p className="text-[11px] text-mute">
              Via {c.route} · {plan}
            </p>
          </div>
        </div>

        <div className="mt-3.5">
          <div className="mb-1.5 flex justify-between text-[11.5px] text-mute">
            <span>Progress barang</span>
            <b className="text-pine-deep">{progressText}</b>
          </div>
          <ProgressBar value={percent} className="h-2" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onShowMembers}
            aria-label="Lihat anggota rombongan"
            className="flex items-center gap-2"
          >
            <AvatarStack names={c.members.map((m) => m.name)} />
            <span className="text-[10.5px] text-mute">{c.members.length} anggota</span>
          </button>
          {isLeader && (
            <button
              type="button"
              onClick={onInvite}
              className="ml-1 flex items-center gap-1 rounded-full bg-[#E7F0E1] px-2.5 py-[5px] text-[11px] font-semibold text-pine-deep"
            >
              <UserPlus size={12} />
              Undang
            </button>
          )}
        </div>

        <p className="mt-2 flex items-center gap-1 text-[10.5px] text-mute">
          {isLeader ? (
            <>
              <Crown size={11} className="shrink-0 text-[#8A6417]" />
              {meName} (Ketua) — kamu bisa kelola anggota &amp; checklist ini
            </>
          ) : (
            'Kamu anggota. Klaim barang yang akan kamu bawa, lalu centang kalau sudah siap.'
          )}
        </p>
      </header>

      {/* Desktop: tautan kembali + kartu judul */}
      <div className="hidden md:block md:pt-[22px]">
        <Link to="/checklist" className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-mute hover:text-ink">
          <ArrowLeft size={14} />
          Checklist Saya
        </Link>

        <div className="mb-[22px] rounded-[20px] border border-line bg-paper px-[26px] py-6">
          <div className="flex items-start justify-between gap-3.5">
            <div>
              <h1 className="font-heading text-[26px] font-bold">{c.mountain.name}</h1>
              <p className="mt-1 text-[13.5px] text-mute">
                Via {c.route} · {plan}
              </p>
            </div>
            <RoleBadge role={c.role} />
          </div>
          <div className="mb-[9px] mt-[22px] flex justify-between text-[13px] text-mute">
            <span>Progress barang</span>
            <b className="text-pine-deep">{progressText}</b>
          </div>
          <ProgressBar value={percent} className="h-2.5" />
        </div>
      </div>
    </>
  )
}
