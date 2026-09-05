import { useState } from 'react'
import { useRoughSvg } from './useRoughSvg'
import s from './sketch.module.css'

let seedCounter = 1

export default function SketchBox({
  children,
  className = '',
  stroke = 'var(--color-ink)',
  strokeWidth = 1.75,
  roughness = 1.6,
  fill,
  fillStyle = 'hachure',
  rotate = 0,
  style
}: {
  children?: React.ReactNode
  className?: string
  stroke?: string
  strokeWidth?: number
  roughness?: number
  fill?: string
  fillStyle?: 'hachure' | 'solid' | 'cross-hatch'
  rotate?: number
  style?: React.CSSProperties
}): React.JSX.Element {
  const [seed] = useState(() => seedCounter++)

  const [containerRef, svgRef] = useRoughSvg((rc, width, height) => {
    const inset = strokeWidth
    const node = rc.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
      stroke,
      strokeWidth,
      roughness,
      seed,
      fill,
      fillStyle,
      fillWeight: 0.8,
      hachureGap: 4.5
    })
    return [node]
  })

  return (
    <div
      ref={containerRef}
      className={`${s.wrap} ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style }}
    >
      <svg ref={svgRef} className={s.overlaySvg}>
        <title>decorative</title>
      </svg>
      <div className={s.content}>{children}</div>
    </div>
  )
}
