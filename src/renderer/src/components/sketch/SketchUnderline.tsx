const RAINBOW = ['#e8a33d', '#e05a5a', '#a56de2', '#4fa3d1']

const SEGMENTS = [
  'M0 4 Q 12.5 -2 25 4',
  'M25 4 Q 37.5 10 50 4',
  'M50 4 Q 62.5 -2 75 4',
  'M75 4 Q 87.5 10 100 4'
]

export default function SketchUnderline({
  className = '',
  color = 'currentColor',
  rainbow = false
}: {
  className?: string
  color?: string
  /** Render as four differently-colored wave segments instead of one solid stroke. */
  rainbow?: boolean
}): React.JSX.Element {
  return (
    <svg viewBox="0 0 100 8" preserveAspectRatio="none" className={className} aria-hidden="true">
      {rainbow ? (
        SEGMENTS.map((d, i) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={RAINBOW[i % RAINBOW.length]}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))
      ) : (
        <path
          d="M1 4.5c8-3 16 3 24-0.5s16-3.5 24 0 16 3 24-0.5 16-3 25 0.5"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}
