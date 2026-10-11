import { useState } from 'react'
import { Compass } from 'lucide-react'
import { formatDateRange } from '../../utils/date'

export default function DraftCard({ draft, onSave, onDismiss }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  // busy sengaja tidak di-reset saat sukses: kartu hilang sendiri setelah daftar dimuat ulang
  const run = async (action) => {
    setBusy(true)
    setFailed(false)
    try {
      await action(draft.id)
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  return (
    <section className="mt-3.5 rounded-[14px] border border-[#DCE8D5] bg-[#EFF4EB] px-3.5 py-[13px] md:mb-[18px] md:mt-0 md:flex md:items-center md:gap-[18px] md:rounded-2xl md:px-5 md:py-[18px]">
      <span className="hidden size-[42px] shrink-0 items-center justify-center rounded-xl bg-[#E3EEE6] text-leaf-deep md:flex">
        <Compass size={19} />
      </span>

      <div className="md:flex-1">
        <p className="mb-1 flex items-center gap-[5px] text-[10.5px] font-bold text-leaf-deep md:mb-[3px] md:text-[11.5px]">
          <Compass size={13} className="md:hidden" />
          Terdeteksi Pendakian Baru
        </p>
        <p className="mb-2.5 text-xs leading-normal text-[#2E4A38] md:mb-0 md:text-[13.5px]">
          Sepertinya kamu baru mendaki <b>{draft.mountain.name}</b>,{' '}
          {formatDateRange(draft.startDate, draft.endDate)}. Mau simpan ke Logbook?
        </p>
        {failed && <p className="mt-2 text-[11px] text-warn">Gagal memproses. Coba lagi.</p>}
      </div>

      <div className="flex gap-2 md:shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onSave)}
          className="flex-1 rounded-[10px] bg-leaf-deep py-2 text-[11.5px] font-semibold text-white disabled:opacity-60 md:flex-none md:rounded-[11px] md:px-[18px] md:py-2.5 md:text-[13px]"
        >
          Simpan ke Logbook
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onDismiss)}
          className="px-3 py-2 text-[11.5px] font-semibold text-mute disabled:opacity-60 md:rounded-[11px] md:border md:border-line md:bg-paper md:px-[18px] md:py-2.5 md:text-[13px] md:text-ink"
        >
          Abaikan
        </button>
      </div>
    </section>
  )
}