import { Link } from 'react-router-dom'
import { ChevronRight, Map as MapIcon } from 'lucide-react'
import TopBar from '../../components/layout/TopBar'
import HeroCarousel, { HeroSkeleton } from '../../components/home/HeroCarousel'
import MountainSection from '../../components/mountain/MountainSection'
import NotificationBell from '../../components/notifications/NotificationBell'
import Logo from '../../components/ui/Logo'
import { getHeroSlides, getMountains, getRecommendedMountains } from '../../api/mountain'
import { useAsync } from '../../hooks/useAsync'

const mobileIcon =
  'flex size-[34px] items-center justify-center rounded-full border border-line bg-paper text-ink'

export default function Home() {
  const slides = useAsync(getHeroSlides, [])
  const popular = useAsync(() => getMountains({ sort: 'popular', limit: 4 }), [])
  const recommended = useAsync(getRecommendedMountains, [])
  const newest = useAsync(() => getMountains({ sort: 'newest', limit: 4 }), [])

  return (
    <>
      <TopBar
        right={
          <div className="flex items-center gap-2">
            <Link to="/saved-maps" className={mobileIcon} aria-label="Peta Tersimpan">
              <MapIcon size={16} />
            </Link>
            <NotificationBell className={mobileIcon} size={16} />
          </div>
        }
      >
        <div className="flex items-center gap-2">
          <Logo size={30} />
          <span className="font-heading text-[17px] font-bold tracking-tight">SummitsGo</span>
        </div>
      </TopBar>

      {slides.loading && <HeroSkeleton />}
      {slides.data && <HeroCarousel slides={slides.data} />}

      <div className="px-5 md:px-0">
        <MountainSection title="Gunung Populer" state={popular} />

        <Link
          to="/saved-maps"
          className="my-1.5 flex items-center gap-3 rounded-2xl border border-line bg-paper p-3.5 md:gap-3.5 md:px-5 md:py-4"
        >
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[#E7F0E1] text-leaf-deep md:size-[42px] md:rounded-[11px]">
            <MapIcon size={18} />
          </span>
          <span className="flex-1">
            <strong className="block text-[13px] md:text-sm">Peta Tersimpan</strong>
            <span className="text-[11.5px] text-mute md:text-xs">Lihat peta offline yang sudah kamu unduh</span>
          </span>
          <ChevronRight size={18} className="text-mute" />
        </Link>

        <MountainSection title="Direkomendasikan Untukmu" state={recommended} fitTag />
        <MountainSection title="Baru Ditambahkan" state={newest} markNew />
      </div>
    </>
  )
}