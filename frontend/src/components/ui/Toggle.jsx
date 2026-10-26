export default function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-leaf' : 'bg-line'
      }`}
    >
      <span
        className={`absolute top-0.5 size-[18px] rounded-full bg-white transition-all ${
          checked ? 'left-[18px]' : 'left-0.5'
        }`}
      />
    </button>
  )
}