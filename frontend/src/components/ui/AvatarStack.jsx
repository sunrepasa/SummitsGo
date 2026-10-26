import Avatar from './Avatar'

const palette = ['#1F3A2E', '#4E7A3B', '#5A7A8C', '#7A5A3E']
const MAX_SHOWN = 3

export default function AvatarStack({ names, size = 26 }) {
  const shown = names.slice(0, MAX_SHOWN)
  const rest = names.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((name, i) => (
        <Avatar
          key={name}
          name={name}
          size={size}
          className="-ml-[7px] border-2 border-paper first:ml-0"
          style={{ background: palette[i] }}
        />
      ))}
      {rest > 0 && (
        <span
          className="-ml-[7px] inline-flex shrink-0 items-center justify-center rounded-full border-2 border-paper font-heading text-[10px] font-bold text-white"
          style={{ width: size, height: size, background: palette[MAX_SHOWN] }}
        >
          +{rest}
        </span>
      )}
    </div>
  )
}