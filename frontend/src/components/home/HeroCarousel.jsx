import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const INTERVAL_MS = 3500
const frame =
  'relative mx-5 mb-6 mt-3.5 h-[172px] overflow-hidden rounded-[20px] md:mx-0 md:mb-[22px] md:mt-[26px] md:h-[250px] md:rounded-[22px]'

export default function HeroCarousel({ slides }) {
  const [index, setIndex] = useState(0)

  // index ikut jadi dependency supaya klik titik manual me-reset hitungan 3,5 detik
  useEffect(() => {
    if (slides.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS)
    return () => clearInterval(timer)
  }, [slides.length, index])

  return (
    <div className={frame}>
      {slides.map((s, i) => (
        <div
          key={s.id}
          aria-hidden={i !== index}
          className={`absolute inset-0 px-[22px] py-[26px] text-[#F3F1EA] transition-opacity duration-500 md:px-12 md:py-[42px] ${
            i === index ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          style={{ background: `linear-gradient(160deg, ${s.bg[0]} 0%, ${s.bg[1]} 78%)` }}
        >
          <div
            className="absolute -bottom-10 -right-[30px] size-[150px] rounded-full opacity-35 blur-[6px] md:-bottom-[60px] md:-right-10 md:size-[300px] md:blur-lg"
            style={{ background: 'conic-gradient(from 210deg, #7FB069, transparent 40%)' }}
          />
          <div className="relative">
            <p className="mb-2.5 text-[12.5px] text-[#B9CDC1] md:mb-3 md:text-[13px]">{s.eyebrow}</p>
            <h1 className="max-w-[230px] font-heading text-[23px] font-bold leading-[1.28] md:max-w-[520px] md:text-[34px] md:leading-[1.2]">
              {s.title}
            </h1>
            <Link
              to={s.to}
              tabIndex={i === index ? 0 : -1}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-leaf px-4 py-[9px] text-[13.5px] font-semibold text-[#12210F] md:mt-6 md:px-[22px] md:py-[11px] md:text-sm"
            >
              {s.cta}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 left-[22px] z-10 flex gap-[5px] md:bottom-[18px] md:left-12 md:gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-[5px] rounded-full transition-all md:h-1.5 ${
              i === index ? 'w-3.5 bg-white md:w-[18px]' : 'w-[5px] bg-white/35 md:w-1.5'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return <div className={`${frame} animate-pulse bg-line`} />
}