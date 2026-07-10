import type { CSSProperties } from 'react'

// VSU HazMat brand mark — a rounded safety-shield badge with a lab-flask
// crest above the "VSU" monogram. Uses currentColor (gold) throughout.
export default function BrandMark({
  size = 22,
  style,
}: {
  size?: number
  style?: CSSProperties
}) {
  const shield =
    'M5 4.2 C5 3.1 5.5 2.6 6.6 2.6 H17.4 C18.5 2.6 19 3.1 19 4.2 V14 C19 16.8 16.2 19.6 12 21 C7.8 19.6 5 16.8 5 14 Z'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="VSU HazMat"
      style={style}
    >
      {/* shield frame */}
      <path d={shield} fill="currentColor" opacity="0.1" />
      <path d={shield} stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />

      {/* flask crest */}
      <path d="M10.1 4.6 H13.9" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
      <path
        d="M10.5 4.6 V6.3 L9.4 8.2 C9.15 8.7 9.5 9.1 10.1 9.1 H13.9 C14.5 9.1 14.85 8.7 14.6 8.2 L13.5 6.3 V4.6"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.95 7.7 H14.05" stroke="currentColor" strokeWidth="1.05" strokeLinecap="round" />

      {/* VSU monogram */}
      <text
        x="12"
        y="14.9"
        textAnchor="middle"
        fontFamily="Archivo, system-ui, sans-serif"
        fontWeight="800"
        fontSize="4.3"
        letterSpacing="0.06"
        fill="currentColor"
      >
        VSU
      </text>
    </svg>
  )
}
