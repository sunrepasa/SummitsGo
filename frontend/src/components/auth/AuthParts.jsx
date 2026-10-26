export function SubmitButton({ busy = false, busyLabel, disabled = false, children }) {
  return (
    <button
      type="submit"
      disabled={busy || disabled}
      className="w-full rounded-xl bg-pine py-3 text-[13.5px] font-semibold text-white transition-colors hover:bg-pine-deep disabled:opacity-60 md:rounded-[13px] md:py-3.5 md:text-[14.5px]"
    >
      {busy ? busyLabel : children}
    </button>
  )
}

export function SwitchPrompt({ text, action, onClick }) {
  return (
    <p className="mt-[18px] text-center text-xs text-mute md:mt-5 md:text-[13px]">
      {text}{' '}
      <button type="button" onClick={onClick} className="font-bold text-pine-deep">
        {action}
      </button>
    </p>
  )
}

export function FormError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="mb-3 rounded-xl bg-warnbg px-3.5 py-2.5 text-xs font-semibold text-warn">
      {message}
    </p>
  )
}