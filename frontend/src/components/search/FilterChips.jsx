import { useState } from 'react'
import { ChevronDown, Map as MapIcon } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'
import { DifficultyGroup, ElevationGroup, LocationGroup, StatusGroup } from './FilterGroups'
import { ELEVATION_MAX, ELEVATION_MIN, useSearchFilters } from '../../hooks/useSearchFilters'

const sheets = {
  location: { title: 'Lokasi', keys: ['location'] },
  difficulty: { title: 'Tingkat Kesulitan', keys: ['difficulty'] },
  elevation: { title: 'Ketinggian', keys: ['minElevation', 'maxElevation'] },
  status: { title: 'Status Jalur', keys: ['status'] },
}

const withCount = (label, n) => (n > 0 ? `${label} · ${n}` : label)

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-[13px] py-[7px] text-[11.5px] font-medium ${
        active ? 'border-pine bg-pine text-white' : 'border-line bg-paper text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function FilterChips({ provinces, count }) {
  const { filters, setValue, clear } = useSearchFilters()
  const [openId, setOpenId] = useState(null)

  const elevationActive =
    filters.minElevation > ELEVATION_MIN || filters.maxElevation < ELEVATION_MAX

  const chips = [
    { id: 'location', label: filters.location || 'Semua Lokasi', active: Boolean(filters.location) },
    {
      id: 'difficulty',
      label: withCount('Tingkat Kesulitan', filters.difficulty.length),
      active: filters.difficulty.length > 0,
    },
    { id: 'elevation', label: 'Ketinggian', active: elevationActive },
    {
      id: 'status',
      label: withCount('Status Jalur', filters.status.length),
      active: filters.status.length > 0,
    },
  ]

  const sheet = openId ? sheets[openId] : null
  const close = () => setOpenId(null)

  return (
    <>
      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {chips.map(({ id, label, active }) => (
          <Chip key={id} active={active} onClick={() => setOpenId(id)}>
            {label}
            <ChevronDown size={12} />
          </Chip>
        ))}
        <Chip
          active={filters.downloaded}
          onClick={() => setValue('downloaded', filters.downloaded ? '' : '1')}
        >
          <MapIcon size={12} />
          Sudah Diunduh
        </Chip>
      </div>

      <BottomSheet
        open={Boolean(sheet)}
        onClose={close}
        title={sheet?.title}
        footer={
          sheet && (
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => clear(...sheet.keys)}
                className="rounded-xl border border-line bg-paper px-5 py-3 text-[13px] font-semibold"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl bg-pine py-3 text-[13px] font-semibold text-white"
              >
                {count == null ? 'Tampilkan hasil' : `Tampilkan ${count} gunung`}
              </button>
            </div>
          )
        }
      >
        {openId === 'location' && <LocationGroup provinces={provinces} />}
        {openId === 'difficulty' && <DifficultyGroup />}
        {openId === 'elevation' && <ElevationGroup />}
        {openId === 'status' && <StatusGroup />}
      </BottomSheet>
    </>
  )
}