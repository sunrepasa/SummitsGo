import { facilityIcon } from '../mountain/detail/facilityMeta'
import { facilityLabel, facilityOrder } from '../../utils/mountainDetail'

// keterangan ikon fasilitas pada label pos; dibuka dari tombol info
export default function MapLegend() {
  return (
    <div
      role="region"
      aria-label="Keterangan ikon"
      className="absolute right-4 top-16 z-20 rounded-xl bg-paper px-3 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,.15)] md:top-[68px]"
    >
      {facilityOrder.map((type) => {
        const Icon = facilityIcon[type]
        const warn = type === 'blankspot' || type === 'danger'
        return (
          <div key={type} className="mb-1.5 flex items-center gap-2 text-[11px] last:mb-0">
            <Icon size={13} className={warn ? 'text-warn' : 'text-leaf-deep'} />
            {facilityLabel[type]}
          </div>
        )
      })}
    </div>
  )
}
