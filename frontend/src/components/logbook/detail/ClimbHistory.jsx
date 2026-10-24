import { BadgeCheck, PencilLine } from 'lucide-react'

function Count({ icon: Icon, value, label, tone }) {
  return (
    <div className="flex flex-1 items-center gap-2.5">
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full md:size-9 ${tone}`}>
        <Icon size={15} />
      </span>
      <div className="leading-tight">
        <b className="block font-heading text-[15px] md:text-lg">{value}×</b>
        <span className="text-[10px] text-mute md:text-[11.5px]">{label}</span>
      </div>
    </div>
  )
}

// Rekap berapa kali gunung ini didaki, dipisah antara yang terverifikasi dan yang ditambah manual.
export default function ClimbHistory({ climbs, mountainName }) {
  if (!climbs) return null
  const total = climbs.verified + climbs.manual
  if (total === 0) return null

  return (
    <section
      aria-label="Riwayat pendakian di gunung ini"
      className="border-b border-line px-5 py-3.5 md:rounded-2xl md:border md:bg-paper md:p-4"
    >
      <p className="mb-2.5 text-[11.5px] text-mute md:text-xs">
        {mountainName} sudah kamu daki <b className="text-ink">{total}×</b>
      </p>
      <div className="flex gap-3">
        {climbs.verified > 0 && (
          <Count icon={BadgeCheck} value={climbs.verified} label="Terverifikasi" tone="bg-pine/10 text-pine" />
        )}
        {climbs.manual > 0 && (
          <Count icon={PencilLine} value={climbs.manual} label="Ditambah manual" tone="bg-stone text-mute" />
        )}
      </div>
    </section>
  )
}