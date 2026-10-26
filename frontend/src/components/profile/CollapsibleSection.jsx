import { ChevronDown } from 'lucide-react'

// Bagian formulir yang bisa dibuka-tutup. Saat tertutup, `summary` menunjukkan isinya secara singkat;
// warn=true mewarnai ringkasan sebagai peringatan (misalnya ada isian yang salah di dalam bagian yang tertutup).
export default function CollapsibleSection({ title, summary, warn = false, open, onToggle, children }) {
  return (
    <div className="mt-5 border-t border-line">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold">{title}</span>
          {!open && summary && (
            <span className={`mt-0.5 block truncate text-[11px] ${warn ? 'font-semibold text-warn' : 'text-mute'}`}>
              {summary}
            </span>
          )}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-mute transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-1 pt-1">{children}</div>}
    </div>
  )
}
