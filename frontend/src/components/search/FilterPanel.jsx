import { Map as MapIcon } from 'lucide-react'
import Toggle from '../ui/Toggle'
import { useSearchFilters } from '../../hooks/useSearchFilters'
import { DifficultyGroup, ElevationGroup, LocationGroup, StatusGroup } from './FilterGroups'

function Group({ title, children }) {
  return (
    <div className="border-t border-line py-3.5 first:border-t-0 first:pt-0">
      <p className="mb-[9px] text-xs font-semibold">{title}</p>
      {children}
    </div>
  )
}

export default function FilterPanel({ provinces }) {
  const { filters, setValue } = useSearchFilters()

  return (
    <div>
      <h2 className="mb-4 font-heading text-base font-bold">Filter</h2>
      <Group title="Lokasi">
        <LocationGroup provinces={provinces} />
      </Group>
      <Group title="Tingkat Kesulitan">
        <DifficultyGroup />
      </Group>
      <Group title="Ketinggian">
        <ElevationGroup />
      </Group>
      <Group title="Status Jalur">
        <StatusGroup />
      </Group>
      <Group>
        <div className="flex items-center justify-between text-[12.5px] font-semibold">
          <span className="flex items-center gap-1.5">
            <MapIcon size={14} />
            Sudah Diunduh
          </span>
          <Toggle
            checked={filters.downloaded}
            onChange={(on) => setValue('downloaded', on ? '1' : '')}
            label="Sudah Diunduh"
          />
        </div>
      </Group>
    </div>
  )
}