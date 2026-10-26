const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function InstagramIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3" />
      <path d="M16.5 7.5v.01" />
    </svg>
  )
}

export function TikTokIcon({ size = 18, ...props }) {
  return (
    <svg width={size} height={size} {...base} {...props}>
      <path d="M21 7.917v4.034a9.948 9.948 0 0 1 -5 -1.951v4.5a6.5 6.5 0 1 1 -8 -6.326v4.326a2.5 2.5 0 1 0 4 2v-11.5h4.083a6.005 6.005 0 0 0 4.917 4.917z" />
    </svg>
  )
}