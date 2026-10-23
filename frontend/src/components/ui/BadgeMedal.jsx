import { useState } from 'react'

const palettes = {
  bronze: { ringFrom: '#E8B589', ringTo: '#9A5526', faceFrom: '#CE9262', faceTo: '#8B4A1D', ink: '#FFF4EA' },
  silver: { ringFrom: '#F4F6F8', ringTo: '#9AA3AB', faceFrom: '#D5DBE0', faceTo: '#8B949C', ink: '#2A3138' },
  gold: { ringFrom: '#FFE69A', ringTo: '#B9840F', faceFrom: '#F5C94F', faceTo: '#B8860B', ink: '#4A3200' },
  leaf: { ringFrom: '#B8D8A6', ringTo: '#4E7A3B', faceFrom: '#82B46C', faceTo: '#3F6B2E', ink: '#F3F8EE' },
}

export default function BadgeMedal({ icon: Icon, tier, label, image, size = 56, showLabel = true }) {
  // bila file gambar gagal dimuat (hilang atau salah nama), kembali ke lencana gambar-otomatis
  const [failedImage, setFailedImage] = useState(null)
  const palette = palettes[tier]
  const withLabel = showLabel && Boolean(label)

  if (image && failedImage !== image) {
    // gambar lencana berbentuk perisai transparan dan sudah memuat tulisannya sendiri: jangan dipotong bulat
    return (
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        onError={() => setFailedImage(image)}
        className="shrink-0 object-contain"
      />
    )
  }

  return (
    <span
      className="relative inline-block shrink-0"
      style={{ width: size, height: size, color: palette.ink }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`medal-ring-${tier}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.ringFrom} />
            <stop offset="1" stopColor={palette.ringTo} />
          </linearGradient>
          <linearGradient id={`medal-face-${tier}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={palette.faceFrom} />
            <stop offset="1" stopColor={palette.faceTo} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="31" fill={`url(#medal-ring-${tier})`} />
        <circle cx="32" cy="32" r="26" fill={`url(#medal-face-${tier})`} />
        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
        <path
          d="M14 24a20 20 0 0 1 36 0"
          fill="none"
          stroke="rgba(255,255,255,.45)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <span
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ gap: Math.round(size * 0.02) }}
      >
        <Icon size={Math.round(size * (withLabel ? 0.34 : 0.48))} strokeWidth={2.25} />
        {withLabel && (
          <span
            className="font-heading font-bold leading-none"
            style={{ fontSize: Math.max(7, Math.round(size * 0.18)) }}
          >
            {label}
          </span>
        )}
      </span>
    </span>
  )
}