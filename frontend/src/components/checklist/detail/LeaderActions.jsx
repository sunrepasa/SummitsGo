import { Save, Trash2 } from 'lucide-react'

const base =
  'flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-line bg-paper py-3 text-[12.5px] font-semibold md:py-[11px] md:text-[13px]'

export default function LeaderActions({ onSaveTemplate, onDelete }) {
  return (
    <div className="flex flex-col gap-2.5">
      <button type="button" onClick={onSaveTemplate} className={`${base} text-ink`}>
        <Save size={15} className="shrink-0" />
        Simpan sebagai Template
      </button>
      <button type="button" onClick={onDelete} className={`${base} text-warn hover:bg-warnbg`}>
        <Trash2 size={15} className="shrink-0" />
        Hapus Checklist
      </button>
    </div>
  )
}