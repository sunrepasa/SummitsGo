import { Star } from 'lucide-react'

export default function Stars({ value, size = 13 }) {
  const filled = Math.round(value)
  return (
    <span className="inline-flex gap-px text-[#E0A93B]" role="img" aria-label={`${value} dari 5 bintang`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < filled ? 'currentColor' : 'none'}
          strokeWidth={i < filled ? 0 : 1.6}
        />
      ))}
    </span>
  )
}
