import { BatteryCharging, Droplets, Shirt, Sparkles } from 'lucide-react'

const icons = { jacket: Shirt, water: Droplets, battery: BatteryCharging }
const ORDER = ['jacket', 'water', 'battery']

// added: saran yang baru ditambahkan di sesi ini. Daftar dari server sudah tidak memuatnya
// (barangnya sudah ada), tapi tetap ditampilkan sebagai "Ditambahkan" supaya pengguna melihat hasil aksinya.
export default function Recommendations({ mountainName, recommendations, added, busy, onAdd }) {
  const addedKeys = new Set(added.map((r) => r.key))
  const all = [...added, ...recommendations.filter((r) => !addedKeys.has(r.key))].sort(
    (a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key),
  )
  if (all.length === 0) return null

  return (
    <section className="mx-5 mt-3.5 border-t border-line pb-2 pt-[18px] md:mx-0 md:mt-0 md:pb-0 md:pt-[22px]">
      <h2 className="mb-2 flex items-center gap-1.5 font-heading text-[13px] font-bold md:mb-3 md:text-base">
        <Sparkles size={15} className="text-leaf-deep" />
        Rekomendasi untuk {mountainName}
      </h2>
      {all.map((r) => {
        const Icon = icons[r.icon] ?? Sparkles
        const done = addedKeys.has(r.key)
        return (
          <div
            key={r.key}
            className={`mb-2 flex items-center gap-2.5 rounded-xl border border-[#DCE8D5] bg-[#EFF4EB] px-3 py-2.5 md:mb-[9px] md:gap-3 md:rounded-[13px] md:px-[15px] md:py-[13px] ${
              done ? 'opacity-60' : ''
            }`}
          >
            <Icon size={17} className="shrink-0 text-leaf-deep" />
            <span className="flex-1 text-[11.5px] text-pine-deep md:text-[13px]">{r.text}</span>
            {done ? (
              <span className="shrink-0 text-[10.5px] font-semibold text-leaf-deep md:text-xs">✓ Ditambahkan</span>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => onAdd(r)}
                className="shrink-0 whitespace-nowrap rounded-full bg-leaf-deep px-2.5 py-[5px] text-[10.5px] font-semibold text-white disabled:opacity-60 md:px-3.5 md:py-1.5 md:text-xs"
              >
                + Tambah
              </button>
            )}
          </div>
        )
      })}
    </section>
  )
}
