const variants = {
  default: 'bg-[#E3EEE6] text-pine-deep',
  ok: 'bg-[#E6F1E4] text-ok',
  warn: 'bg-warnbg text-warn',
  muted: 'border border-line bg-stone text-mute',
  leaf: 'bg-leaf text-[#12210F]',
}

export default function Badge({ variant = 'default', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold md:px-2.5 md:text-[11px] ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}