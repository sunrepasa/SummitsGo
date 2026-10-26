const thumb =
  'pointer-events-none absolute inset-0 h-[15px] w-full appearance-none bg-transparent ' +
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-[15px] [&::-webkit-slider-thumb]:appearance-none ' +
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white ' +
  '[&::-webkit-slider-thumb]:bg-pine [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer ' +
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-[15px] [&::-moz-range-thumb]:rounded-full ' +
  '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-white ' +
  '[&::-moz-range-thumb]:bg-pine [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-track]:bg-transparent'

export default function RangeSlider({ min, max, step = 100, value, onChange }) {
  const [lo, hi] = value
  const pct = (v) => ((v - min) / (max - min)) * 100

  return (
    <div className="relative mx-1 my-2.5 h-[15px]">
      <div className="absolute inset-x-0 top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-line" />
      <div
        className="absolute top-1/2 h-[5px] -translate-y-1/2 rounded-full bg-leaf"
        style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
      />
      <input
        type="range"
        aria-label="Ketinggian minimum"
        min={min}
        max={max}
        step={step}
        value={lo}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
        className={thumb}
        style={{ zIndex: lo > (min + max) / 2 ? 20 : 10 }}
      />
      <input
        type="range"
        aria-label="Ketinggian maksimum"
        min={min}
        max={max}
        step={step}
        value={hi}
        onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
        className={thumb}
        style={{ zIndex: 15 }}
      />
    </div>
  )
}