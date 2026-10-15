import { formatDateRange, formatNights } from '../../../utils/date'

function Stat({ value, label }) {
  return (
    <div className="flex-1 text-center md:rounded-2xl md:border md:border-line md:bg-paper md:p-4">
      <b className="block font-heading text-[13.5px] md:text-xl">{value}</b>
      <span className="text-[10px] text-mute md:text-[11.5px]">{label}</span>
    </div>
  )
}

export default function EntryStats({ entry }) {
  const { startDate, endDate, nights, mountain } = entry

  return (
    <div className="flex gap-2.5 border-b border-line px-5 py-3.5 md:grid md:grid-cols-3 md:gap-3 md:border-0 md:p-0">
      <Stat value={formatDateRange(startDate, endDate)} label="Tanggal" />
      <Stat value={formatNights(nights) ?? '–'} label="Durasi" />
      <Stat value={`${mountain.elevation.toLocaleString('id-ID')} m`} label="Ketinggian" />
    </div>
  )
}
