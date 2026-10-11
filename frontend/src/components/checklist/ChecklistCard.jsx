import { Link } from 'react-router-dom'
import { ChevronRight, Crown } from 'lucide-react'
import AvatarStack from '../ui/AvatarStack'
import Badge from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import { formatDateRange } from '../../utils/date'

export default function ChecklistCard({ checklist: c }) {
  const percent = c.total ? (c.done / c.total) * 100 : 0
  const plan = c.plannedDate ? `Rencana ${formatDateRange(c.plannedDate)}` : 'Belum ada tanggal'

  return (
    <Link
      to={`/checklist/${c.id}`}
      className="block rounded-2xl border border-line bg-paper p-3.5 md:rounded-[18px] md:p-5 md:transition md:hover:-translate-y-[3px] md:hover:shadow-lg"
    >
      <div className="mb-2.5 flex items-start justify-between gap-2.5 md:mb-0">
        <div className="min-w-0">
          <h3 className="font-heading text-[14.5px] font-bold md:text-[17px]">{c.mountain.name}</h3>
          <p className="mt-0.5 text-[11px] text-mute md:mt-[3px] md:text-[12.5px]">
            Via {c.route} · {plan}
          </p>
        </div>
        {c.role === 'leader' ? (
          <Badge variant="gold">
            <Crown size={11} />
            Ketua
          </Badge>
        ) : (
          <Badge>Anggota</Badge>
        )}
      </div>

      <div className="mb-1.5 flex justify-between text-[11px] text-mute md:mb-2 md:mt-5 md:text-xs">
        <span>Progress barang</span>
        <b className="text-pine-deep">
          {c.done}/{c.total} siap
        </b>
      </div>
      <ProgressBar value={percent} className="md:h-2" />

      <div className="mt-2.5 flex items-center md:mt-[18px] md:border-t md:border-line md:pt-4">
        <AvatarStack names={c.members} />
        <span className="ml-2.5 text-[10.5px] text-mute md:text-xs">{c.members.length} anggota</span>
        <ChevronRight size={19} className="ml-auto hidden text-mute md:block" />
      </div>
    </Link>
  )
}

export function ChecklistCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-line bg-paper p-3.5 md:rounded-[18px] md:p-5">
      <div className="h-4 w-1/2 rounded bg-line" />
      <div className="mt-2 h-3 w-2/3 rounded bg-line" />
      <div className="mt-5 h-2 rounded bg-line" />
      <div className="mt-4 h-6 w-1/3 rounded bg-line" />
    </div>
  )
}