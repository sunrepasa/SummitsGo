import { initialsOf } from '../../utils/initials'

export default function Avatar({ name, size = 30, className = '', style }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#3E6B54] to-[#16281F] font-heading font-bold text-white ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.37), ...style }}
    >
      {initialsOf(name)}
    </span>
  )
}