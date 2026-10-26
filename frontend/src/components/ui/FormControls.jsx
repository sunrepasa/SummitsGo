const base =
  'w-full min-w-0 rounded-[11px] border border-line bg-paper px-[13px] py-[11px] text-[12.5px] text-ink outline-none focus:border-pine aria-invalid:border-warn disabled:bg-stone disabled:text-mute md:text-[13px]'

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="mb-3.5">
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11.5px] font-semibold md:text-xs">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] font-semibold text-warn">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-[11px] text-mute">{hint}</p>
      )}
    </div>
  )
}

export function Input({ className = '', ...props }) {
  return <input className={`${base} ${className}`} {...props} />
}

export function PrefixInput({ prefix, invalid = false, disabled = false, className = '', ...props }) {
  return (
    <div
      className={`flex items-center rounded-[11px] border px-[13px] ${
        disabled ? 'bg-stone' : 'bg-paper'
      } ${invalid ? 'border-warn' : 'border-line focus-within:border-pine'} ${className}`}
    >
      <span className="select-none text-[12.5px] text-mute md:text-[13px]">{prefix}</span>
      <input
        disabled={disabled}
        aria-invalid={invalid}
        className="min-w-0 flex-1 bg-transparent py-[11px] pl-1 text-[12.5px] text-ink outline-none disabled:text-mute md:text-[13px]"
        {...props}
      />
    </div>
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${base} ${className}`} {...props}>
      {children}
    </select>
  )
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${base} min-h-[70px] resize-none ${className}`} {...props} />
}