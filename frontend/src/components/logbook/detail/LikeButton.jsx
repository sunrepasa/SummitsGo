import { Heart } from 'lucide-react'

// variant "row": baris di bawah header (mobile); "card": tombol besar di sidebar (desktop)
export default function LikeButton({ liked, count, onToggle, variant = 'row' }) {
  const isCard = variant === 'card'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={liked}
      className={
        isCard
          ? `flex w-full items-center justify-center gap-2.5 rounded-[14px] border p-3.5 text-[15px] font-semibold ${
              liked ? 'border-[#F0D3BD] bg-[#FFF6F0] text-warn' : 'border-line bg-paper text-mute'
            }`
          : `flex items-center gap-1.5 text-[13px] font-semibold ${liked ? 'text-warn' : 'text-mute'}`
      }
    >
      <Heart
        size={isCard ? 21 : 17}
        className={`transition-transform duration-150 ${liked ? 'scale-[1.15] fill-warn' : ''}`}
      />
      {count} suka
    </button>
  )
}
