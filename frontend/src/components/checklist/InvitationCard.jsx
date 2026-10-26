import { useState } from 'react'
import { MailPlus } from 'lucide-react'
import { formatDateRange } from '../../utils/date'

export default function InvitationCard({ invitation: inv, onAccept, onDecline }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  // busy tidak di-reset saat sukses: kartu hilang sendiri setelah daftar dimuat ulang
  const run = async (action) => {
    setBusy(true)
    setFailed(false)
    try {
      await action(inv.id)
    } catch {
      setFailed(true)
      setBusy(false)
    }
  }

  const plan = inv.plannedDate ? `rencana ${formatDateRange(inv.plannedDate)}` : 'belum ada tanggal'

  return (
    <section className="mb-3 rounded-[14px] border border-[#DCE8D5] bg-[#EFF4EB] px-3.5 py-[13px] md:mb-[18px] md:flex md:items-center md:gap-[18px] md:rounded-2xl md:px-5 md:py-[18px]">
      <span className="hidden size-[42px] shrink-0 items-center justify-center rounded-xl bg-[#E3EEE6] text-leaf-deep md:flex">
        <MailPlus size={19} />
      </span>

      <div className="md:flex-1">
        <p className="mb-1 flex items-center gap-[5px] text-[10.5px] font-bold text-leaf-deep md:mb-[3px] md:text-[11.5px]">
          <MailPlus size={13} className="md:hidden" />
          Undangan Checklist
        </p>
        <p className="mb-2.5 text-xs leading-normal text-[#2E4A38] md:mb-0 md:text-[13.5px]">
          <b>{inv.from}</b> mengundangmu ke checklist <b>{inv.mountain.name}</b> via {inv.route} ({plan}).
        </p>
        {failed && <p className="mt-2 text-[11px] text-warn">Gagal memproses. Coba lagi.</p>}
      </div>

      <div className="flex gap-2 md:shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onAccept)}
          className="flex-1 rounded-[10px] bg-leaf-deep py-2 text-[11.5px] font-semibold text-white disabled:opacity-60 md:flex-none md:rounded-[11px] md:px-[18px] md:py-2.5 md:text-[13px]"
        >
          Terima
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => run(onDecline)}
          className="px-3 py-2 text-[11.5px] font-semibold text-mute disabled:opacity-60 md:rounded-[11px] md:border md:border-line md:bg-paper md:px-[18px] md:py-2.5 md:text-[13px] md:text-ink"
        >
          Abaikan
        </button>
      </div>
    </section>
  )
}
