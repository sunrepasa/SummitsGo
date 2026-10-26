import Checkbox from '../ui/Checkbox'
import RangeSlider from '../ui/RangeSlider'
import { ELEVATION_MAX, ELEVATION_MIN, useSearchFilters } from '../../hooks/useSearchFilters'
import { difficultyLabel, formatElevation, statusLabel } from '../../utils/mountainLabels'

export function LocationGroup({ provinces }) {
  const { filters, setValue } = useSearchFilters()

  return (
    <select
      aria-label="Lokasi"
      value={filters.location}
      onChange={(e) => setValue('location', e.target.value)}
      className="w-full rounded-[11px] border border-line bg-paper px-3 py-2.5 text-[12.5px]"
    >
      <option value="">Semua Lokasi</option>
      {provinces.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  )
}

export function DifficultyGroup() {
  const { filters, toggleValue } = useSearchFilters()

  return (
    <div>
      {Object.entries(difficultyLabel).map(([value, label]) => (
        <Checkbox
          key={value}
          checked={filters.difficulty.includes(value)}
          onChange={() => toggleValue('difficulty', value)}
        >
          {label}
        </Checkbox>
      ))}
    </div>
  )
}

export function ElevationGroup() {
  const { filters, setElevation } = useSearchFilters()

  return (
    <div>
      <RangeSlider
        min={ELEVATION_MIN}
        max={ELEVATION_MAX}
        value={[filters.minElevation, filters.maxElevation]}
        onChange={([lo, hi]) => setElevation(lo, hi)}
      />
      <div className="flex justify-between text-[11px] text-mute">
        <span>{formatElevation(filters.minElevation)}</span>
        <span>{formatElevation(filters.maxElevation)}</span>
      </div>
    </div>
  )
}

export function StatusGroup() {
  const { filters, toggleValue } = useSearchFilters()

  return (
    <div>
      {Object.entries(statusLabel).map(([value, label]) => (
        <Checkbox
          key={value}
          checked={filters.status.includes(value)}
          onChange={() => toggleValue('status', value)}
        >
          {label}
        </Checkbox>
      ))}
    </div>
  )
}