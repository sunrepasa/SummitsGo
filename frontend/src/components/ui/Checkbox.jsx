import { Check } from 'lucide-react'

export default function Checkbox({ checked, onChange, children }) {
  return (
    <label className="flex cursor-pointer items-center gap-[9px] py-[5px] text-[12.5px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        className={`flex size-[17px] items-center justify-center rounded-[5px] border-[1.5px] text-white peer-focus-visible:ring-2 peer-focus-visible:ring-leaf ${
          checked ? 'border-pine bg-pine' : 'border-line bg-paper'
        }`}
      >
        {checked && <Check size={12} strokeWidth={3} />}
      </span>
      {children}
    </label>
  )
}