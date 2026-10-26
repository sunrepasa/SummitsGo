import { Bookmark } from 'lucide-react'

// variant 'bar': bar tetap di bawah (mobile, menutupi BottomNav); 'inline': di sidebar (desktop)
export default function ActionBar({ variant, saved, saving, onToggleSave, onChecklist }) {
  const wrapper =
    variant === 'bar'
      ? 'fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-line bg-paper px-5 pb-4 pt-3 md:hidden'
      : 'hidden gap-2.5 md:flex'

  return (
    <div className={wrapper}>
      <button
        type="button"
        onClick={onToggleSave}
        disabled={saving}
        aria-pressed={saved}
        aria-label={saved ? 'Hapus dari gunung tersimpan' : 'Simpan gunung'}
        title={saved ? 'Hapus dari gunung tersimpan' : 'Simpan gunung'}
        className={`flex size-[46px] shrink-0 items-center justify-center rounded-xl border md:size-[50px] md:rounded-[13px] ${
          saved ? 'border-[#F0DFAE] bg-[#FFF8E6] text-[#E0A93B]' : 'border-line bg-paper text-ink'
        }`}
      >
        <Bookmark size={19} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <button
        type="button"
        onClick={onChecklist}
        className="h-[46px] flex-1 rounded-xl bg-pine text-[13.5px] font-semibold text-white hover:bg-pine-deep md:h-[50px] md:rounded-[13px] md:text-sm"
      >
        Tambah ke Checklist
      </button>
    </div>
  )
}
