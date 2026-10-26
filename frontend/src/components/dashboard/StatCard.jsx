export default function StatCard({ value, label }) {
  return (
    <div className="rounded-[14px] border border-line bg-paper p-3 text-center md:rounded-[18px] md:p-5 md:text-left">
      <b className="block font-heading text-lg md:text-[32px]">{value}</b>
      <span className="text-[10px] text-mute md:text-[13px]">{label}</span>
    </div>
  )
}
