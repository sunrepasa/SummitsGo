import { Mountain, Search } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import FilterPanel from '../../components/search/FilterPanel'
import MountainRow, { MountainRowSkeleton } from '../../components/mountain/MountainRow'
import { getMountains, getProvinces } from '../../api/mountain'
import { useAsync } from '../../hooks/useAsync'
import { useDebounce } from '../../hooks/useDebounce'
import { parseFilters, toApiFilters, useSearchFilters } from '../../hooks/useSearchFilters'
import { getSavedMapIds } from '../../utils/savedMaps'

const sortOptions = [
  { value: 'popular', label: 'Urutkan: Terpopuler' },
  { value: 'nearest', label: 'Urutkan: Terdekat' },
  { value: 'name', label: 'Urutkan: Nama A-Z' },
]

export default function SearchPage() {
  const { params, filters, setValue } = useSearchFilters()
  const query = useDebounce(params.toString(), 300)

  const provinces = useAsync(getProvinces, [])
  const results = useAsync(() => getMountains(toApiFilters(parseFilters(new URLSearchParams(query)))), [query])

  const savedIds = getSavedMapIds()
  const list = results.data && (filters.downloaded ? results.data.filter((m) => savedIds.includes(m.id)) : results.data)

  let body
  if (results.error) {
    body = (
      <p className="rounded-xl bg-warnbg px-4 py-3 text-[12.5px] text-warn">
        Gagal memuat data gunung. Coba muat ulang halaman.
      </p>
    )
  } else if (!list) {
    body = (
      <ul className="divide-y divide-dashed divide-line md:space-y-3.5 md:divide-y-0">
        {Array.from({ length: 5 }, (_, i) => (
          <li key={i}>
            <MountainRowSkeleton />
          </li>
        ))}
      </ul>
    )
  } else if (list.length === 0) {
    body = (
      <div className="px-[30px] py-[60px] text-center text-mute">
        <Mountain size={36} strokeWidth={1.5} className="mx-auto mb-2.5" />
        <p className="text-[12.5px]">
          Gunung tidak ditemukan.
          <br />
          Coba kata kunci atau filter lain.
        </p>
      </div>
    )
  } else {
    body = (
      <ul className="divide-y divide-dashed divide-line md:space-y-3.5 md:divide-y-0">
        {list.map((m) => (
          <li key={m.id}>
            <MountainRow mountain={m} saved={savedIds.includes(m.id)} />
          </li>
        ))}
      </ul>
    )
  }

  const countLabel = results.error ? '' : list ? `${list.length} gunung ditemukan` : 'Mencari...'

  return (
    <>
      <TopBar>
        <div className="w-full">
          <h1 className="mb-3 font-heading text-lg font-bold">Cari Gunung</h1>
          <label className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-2.5 focus-within:border-pine">
            <Search size={15} className="shrink-0 text-mute" />
            <input
              value={filters.q}
              onChange={(e) => setValue('q', e.target.value)}
              placeholder="Cari nama gunung atau lokasi..."
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-mute"
            />
          </label>
        </div>
      </TopBar>

      <div className="md:grid md:grid-cols-[270px_1fr] md:items-start md:gap-8 md:pb-6 md:pt-7">
        <aside className="sticky top-[86px] hidden rounded-[18px] border border-line bg-paper p-5 md:block">
          <FilterPanel provinces={provinces.data ?? []} />
        </aside>

        <section>
          <div className="flex items-center justify-between px-5 pb-2 pt-3.5 md:mb-4 md:px-0 md:pb-0 md:pt-0">
            <div>
              <h1 className="hidden font-heading text-[22px] font-bold md:block">Cari Gunung</h1>
              <p className="text-[11.5px] text-mute md:mt-[3px] md:text-[12.5px]">{countLabel}</p>
            </div>
            <select
              aria-label="Urutkan"
              value={filters.sort}
              onChange={(e) => setValue('sort', e.target.value)}
              className="bg-transparent text-[11.5px] font-semibold md:rounded-full md:border md:border-line md:bg-paper md:px-4 md:py-[9px] md:text-[12.5px]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="px-5 md:px-0">{body}</div>
        </section>
      </div>
    </>
  )
}