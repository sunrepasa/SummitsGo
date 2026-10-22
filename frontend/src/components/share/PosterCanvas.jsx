import { BadgeCheck } from 'lucide-react'
import Logo from '../ui/Logo'
import { formatDateRange, formatNights } from '../../utils/date'
import { POSTER_HEIGHT, POSTER_WIDTH } from '../../utils/posterImage'
import { photoBackground, shortDuration, shortRange } from '../../utils/posterTemplates'

function VerifiedTag({ verified }) {
  if (!verified) return null
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-[9px] py-[3px] text-[9px] font-bold text-pine-deep">
      <BadgeCheck size={10} />
      Terverifikasi
    </span>
  )
}

function Brand({ className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 font-heading text-[11px] font-bold ${className}`}>
      <Logo size={18} tone="glass" />
      SummitsGo
    </div>
  )
}

function FullPhoto({ data, photo }) {
  return (
    <div className="absolute inset-0 text-white" style={{ background: photoBackground(photo) }}>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05)_35%,rgba(10,20,15,.85)_100%)]" />
      <div className="absolute left-[18px] right-[18px] top-[18px] flex items-center justify-between">
        <VerifiedTag verified={data.verified} />
        <Brand className="ml-auto" />
      </div>
      <div className="absolute bottom-[22px] left-5 right-5">
        <h3 className="mb-1 mt-2.5 font-heading text-[30px] font-bold leading-[1.05]">{data.mountainName}</h3>
        <div className="mt-1.5 text-[11.5px] leading-normal opacity-90">
          Via {data.route}
          <br />
          {formatDateRange(data.startDate, data.endDate)}
          {data.nights != null && ` · ${formatNights(data.nights)}`} · {data.elevation} mdpl
        </div>
        {data.username && <div className="mt-3 text-[11px] opacity-80">@{data.username}</div>}
      </div>
    </div>
  )
}

function StatCard({ data, photo }) {
  const stats = [
    [shortRange(data.startDate, data.endDate), 'Tanggal'],
    [shortDuration(data.nights), 'Durasi'],
    [`${data.elevation} m`, 'Ketinggian'],
  ]
  return (
    <div className="absolute inset-0 bg-paper text-ink">
      <div className="absolute inset-x-0 top-0 h-[56%]" style={{ background: photoBackground(photo) }}>
        <span className="absolute left-3.5 top-3.5">
          <VerifiedTag verified={data.verified} />
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[46%] rounded-t-[20px] bg-paper p-5">
        <h3 className="font-heading text-[22px] font-bold">{data.mountainName}</h3>
        <div className="mt-0.5 text-[11.5px] text-mute">Via {data.route}</div>
        <div className="mt-3.5 grid grid-cols-3 gap-1.5">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-[10px] bg-stone px-1 py-[9px] text-center">
              <b className="block font-heading text-[11.5px]">{value}</b>
              <span className="text-[8.5px] text-mute">{label}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-5 bottom-4 flex items-center justify-between text-[10.5px] text-mute">
          <span>{data.username ? `@${data.username}` : ''}</span>
          <Brand className="text-pine" />
        </div>
      </div>
    </div>
  )
}

function Minimal({ data }) {
  const rows = [
    ['Tanggal', formatDateRange(data.startDate, data.endDate)],
    ['Durasi', formatNights(data.nights) ?? '–'],
    ['Ketinggian', `${data.elevation} mdpl`],
  ]
  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[linear-gradient(160deg,#24473A,#142822_85%)] px-[22px] py-6 text-white">
      <div className="pointer-events-none absolute -bottom-[60px] -right-[60px] size-[240px] rounded-full bg-[conic-gradient(from_210deg,#7FB069,transparent_40%)] opacity-30 blur-[8px]" />
      <div className="relative self-start">
        <VerifiedTag verified={data.verified} />
      </div>
      <h3 className="mt-auto font-heading text-[34px] font-bold leading-[1.05]">{data.mountainName}</h3>
      <div className="mt-1.5 text-[12.5px] opacity-80">Via {data.route}</div>
      <div className="relative mt-[26px] flex flex-col gap-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between border-t border-white/20 pt-[9px] text-xs">
            <span className="opacity-70">{label}</span>
            <b>{value}</b>
          </div>
        ))}
      </div>
      {data.username && <div className="relative mt-5 text-[11px] opacity-80">@{data.username}</div>}
      <Brand className="relative mt-3.5" />
    </div>
  )
}

// Ukuran asli poster 270x480. Dipakai apa adanya untuk render PNG; tampilan kecil memakai PosterPreview.
export default function PosterCanvas({ template, data, photo }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl font-body"
      style={{ width: POSTER_WIDTH, height: POSTER_HEIGHT }}
    >
      {template === 'full' && <FullPhoto data={data} photo={photo} />}
      {template === 'card' && <StatCard data={data} photo={photo} />}
      {template === 'minimal' && <Minimal data={data} />}
    </div>
  )
}

// poster diperkecil dengan transform; kotak luarnya dihitung ulang karena transform tidak mengubah tata letak
export function PosterPreview({ scale, ...props }) {
  return (
    <div style={{ width: POSTER_WIDTH * scale, height: POSTER_HEIGHT * scale }} className="mx-auto">
      <div
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
        className="shadow-[0_14px_30px_rgba(20,40,34,.3)] [border-radius:16px]"
      >
        <PosterCanvas {...props} />
      </div>
    </div>
  )
}
