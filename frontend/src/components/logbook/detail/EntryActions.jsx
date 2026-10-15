import { PenLine, Pencil, Share2, Trash2 } from 'lucide-react'

const base = 'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold'
const ghost = `${base} border border-line bg-paper text-ink hover:bg-stone`

// kartu aksi desktop; di mobile aksi yang sama ada di menu ⋮ dan tombol Tulis Review di bawah
export default function EntryActions({ onReview, onShare, onEditNote, onDelete }) {
  return (
    <section className="hidden rounded-[18px] border border-line bg-paper p-[22px] md:block">
      <div className="flex flex-col gap-2.5">
        <button type="button" onClick={onReview} className={`${base} bg-pine text-white hover:bg-pine-deep`}>
          <PenLine size={15} />
          Tulis Review dari Sini
        </button>
        <button type="button" onClick={onShare} className={ghost}>
          <Share2 size={15} />
          Bagikan
        </button>
        <button type="button" onClick={onEditNote} className={ghost}>
          <Pencil size={15} />
          Edit Catatan
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={`${base} border border-line bg-paper text-warn hover:bg-warnbg`}
        >
          <Trash2 size={15} />
          Hapus Entri
        </button>
      </div>
    </section>
  )
}
