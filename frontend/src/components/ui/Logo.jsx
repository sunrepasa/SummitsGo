import { useState } from 'react'
import { Mountain } from 'lucide-react'

const tones = { pine: 'bg-pine', glass: 'bg-white/12' }

// file logo berwarna putih berlatar transparan; kotaknya yang memberi warna latar
export default function Logo({ size = 32, tone = 'pine', className = '' }) {
  const [failed, setFailed] = useState(false)

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-white ${tones[tone]} ${className}`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.28) }}
    >
      {failed ? (
        <Mountain size={Math.round(size * 0.55)} />
      ) : (
        <img
          src="/brand/Logo.png"
          alt=""
          width={Math.round(size * 0.72)}
          height={Math.round(size * 0.72)}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  )
}