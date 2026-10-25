import { Link } from 'react-router-dom'
import { Crown, Users } from 'lucide-react'
import { formatDateRange } from '../../utils/date'

// Kartu trip aktif: checklist dengan rencana terdekat, lengkap dengan progres barang.
export default function ActiveTripCard({ trip }) {
  const percent = trip.total ? (trip.done / trip.total) * 100 : 0
  const plan = trip.plannedDate ? `Rencana ${formatDateRange(trip.plannedDate)}` : 'Belum ada tanggal'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-[#24473A] to-pine-deep p-4 text-white md:rounded-[20px] md:p-[26px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[30px] -right-[25px] size-[110px] rounded-full bg-[conic-gradient(from_210deg,var(--color-leaf),transparent_40%)] opacity-30 blur-[6px] md:-bottom-[70px] md:-right-[50px] md:size-[260px] md:blur-[8px]"
      />

      <div className="relative">
        <p className="mb-1 text-[10.5px] text-[#B9CDC1] md:mb-1.5 md:text-xs">Trip Aktif · {plan}</p>
        <h3 className="font-heading text-[15px] font-bold md:text-2xl">
          {trip.mountain.name} — Via {trip.route}
        </h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#DCE8D5] md:mt-[5px] md:text-[13px]">
          {trip.role === 'leader' ? <Crown size={12} /> : <Users size={12} />}
          {trip.role === 'leader' ? 'Kamu Ketua' : 'Kamu Anggota'} · {trip.members.length} anggota
        </p>

        <div className="mb-1.5 mt-3 flex justify-between text-[10.5px] text-[#DCE8D5] md:mb-[9px] md:mt-[22px] md:text-[12.5px]">
          <span>Progress barang</span>
          <b>{trip.total ? `${trip.done}/${trip.total} siap` : 'Belum ada barang'}</b>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round(percent)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-[7px] overflow-hidden rounded-full bg-white/20 md:h-[9px]"
        >
          <div className="h-full rounded-full bg-leaf" style={{ width: `${percent}%` }} />
        </div>

        <Link
          to={`/checklist/${trip.id}`}
          className="mt-3 block rounded-[10px] bg-white py-[9px] text-center text-xs font-semibold text-pine-deep md:mt-[22px] md:inline-block md:rounded-xl md:px-6 md:py-3 md:text-[13.5px]"
        >
          Lanjutkan Checklist
        </Link>
      </div>
    </div>
  )
}
