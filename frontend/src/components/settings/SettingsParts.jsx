import Badge from '../ui/Badge'

export function SettingsCard({ title, desc, danger = false, className = '', children }) {
  return (
    <section
      className={`mb-3.5 rounded-[14px] border bg-paper p-4 md:rounded-[18px] md:p-[26px] ${
        danger ? 'border-[#F0D3BD]' : 'border-line'
      } ${className}`}
    >
      {title && (
        <h2 className={`font-heading text-base font-bold md:text-lg ${danger ? 'text-warn' : ''}`}>{title}</h2>
      )}
      {desc && <p className="mb-1.5 mt-1 text-xs leading-normal text-mute md:text-[13px]">{desc}</p>}
      {children}
    </section>
  )
}

export function SettingRow({ title, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line py-3.5 first:border-t-0">
      <div className="min-w-0">
        <div className="text-[13px] font-semibold">{title}</div>
        {desc && <div className="mt-0.5 text-[11.5px] leading-normal text-mute">{desc}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2.5 text-[12.5px]">{children}</div>}
    </div>
  )
}

// fitur yang ada di desain tetapi belum dikerjakan; tampil nonaktif supaya jujur ke pengguna
export function ComingSoon() {
  return <Badge variant="muted">Segera hadir</Badge>
}

export const linkButton = 'text-[12.5px] font-semibold text-leaf-deep hover:underline'
