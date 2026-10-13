import { BadgeCheck, PenLine } from 'lucide-react'
import Section from './Section'
import Stars from '../../ui/Stars'
import { formatDateRange } from '../../../utils/date'

function ReviewItem({ review: r }) {
  return (
    <div className="border-t border-dashed border-line py-2.5 text-xs md:border-solid md:py-4 md:text-[13px]">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <b className="text-[12.5px] md:text-sm">{r.author}</b>
        {r.verified && (
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#E7F0E1] px-1.5 py-0.5 text-[9.5px] font-semibold text-pine-deep md:px-2 md:text-[10.5px]">
            <BadgeCheck size={11} />
            Pendaki Terverifikasi
          </span>
        )}
        <span className="ml-auto">
          <Stars value={r.rating} />
        </span>
      </div>
      <p className="mt-1 leading-normal text-[#3A4640] md:leading-relaxed">{r.text}</p>
      <p className="mt-1 text-[10.5px] text-mute">{formatDateRange(r.createdAt)}</p>
    </div>
  )
}

export default function ReviewsSection({ mountain: m, state, onWrite }) {
  const { data, error, loading, reload } = state

  let list
  if (error) {
    list = (
      <p className="rounded-xl bg-warnbg px-4 py-3 text-xs text-warn">
        Gagal memuat ulasan.{' '}
        <button type="button" onClick={reload} className="font-semibold underline">
          Coba lagi
        </button>
      </p>
    )
  } else if (loading) {
    list = (
      <div className="animate-pulse space-y-3 pt-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-1/3 rounded bg-line" />
            <div className="h-3 w-full rounded bg-line" />
          </div>
        ))}
      </div>
    )
  } else if (data.length === 0) {
    list = (
      <p className="border-t border-dashed border-line py-4 text-center text-xs text-mute md:border-solid">
        Belum ada ulasan. Jadilah yang pertama menulis.
      </p>
    )
  } else {
    list = data.map((r) => <ReviewItem key={r.id} review={r} />)
  }

  return (
    <Section title="Ulasan Pendaki" className="border-b-0">
      <div className="mb-3 md:flex md:items-center md:justify-between">
        <div className="mb-3 flex items-center gap-2.5 md:mb-0 md:gap-3">
          <b className="font-heading text-[22px] md:text-[32px]">{m.rating.toFixed(1)}</b>
          <div>
            <Stars value={m.rating} size={15} />
            <p className="text-[11px] text-mute md:text-xs">{m.reviewCount} ulasan</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onWrite}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-paper py-2.5 text-[12.5px] font-semibold text-pine-deep md:w-auto md:rounded-full md:px-5 md:text-[13px]"
        >
          <PenLine size={14} />
          Tulis Ulasan
        </button>
      </div>
      {list}
    </Section>
  )
}
