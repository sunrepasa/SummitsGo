export default function ProgressBar({ value, className = '' }) {
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-[7px] overflow-hidden rounded-full bg-line ${className}`}
    >
      <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
    </div>
  )
}