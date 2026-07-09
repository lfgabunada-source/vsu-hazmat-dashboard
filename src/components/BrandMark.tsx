import type { CSSProperties } from 'react'

// VSU HazMat brand mark — a lab flask with liquid + bubbles.
// Uses currentColor so it inherits the badge's gold color.
export default function BrandMark({
  size = 22,
  style,
}: {
  size?: number
  style?: CSSProperties
}) {
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
      {/* liquid fill */}
      <path
        d="M7.6 13.9 L5.3 17.7 C4.8 18.6 5.5 19.8 6.6 19.8 H17.4 C18.5 19.8 19.2 18.6 18.7 17.7 L16.4 13.9 Z"
        fill="currentColor"
        opacity="0.28"
      />
      {/* flask outline */}
      <path
        d="M10 3.6 V8.6 L5.3 17.7 C4.8 18.6 5.5 19.8 6.6 19.8 H17.4 C18.5 19.8 19.2 18.6 18.7 17.7 L14 8.6 V3.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* rim */}
      <path d="M9 3.6 H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* liquid surface */}
      <path d="M7.6 13.9 H16.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* bubbles */}
      <circle cx="10.6" cy="16.4" r="0.75" fill="currentColor" />
      <circle cx="13.2" cy="17.4" r="0.6" fill="currentColor" />
      <circle cx="12" cy="11.3" r="0.6" fill="currentColor" opacity="0.65" />
    </svg>
  )
}
