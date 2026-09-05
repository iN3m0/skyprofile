import { useState } from 'react'
import { useRoughSvg } from './useRoughSvg'
import s from './sketch.module.css'

let seedCounter = 5000

/** Hand-hatched progress bar — hachure fill instead of a flat CSS bar. */
export default function SketchProgress({
  progress,
  color = 'var(--color-progress)',
  outlineColor = 'var(--color-ink)',
  height = 16,
  glossy = false
}: {
  progress: number
  color?: string
  outlineColor?: string
  height?: number
  /** Lays a soft highlight over the bar — used to mark a maxed-out stat. */
  glossy?: boolean
}): React.JSX.Element {
  const [seed] = useState(() => seedCounter++)
  const pct = Math.max(0, Math.min(progress, 1))

  const [containerRef, svgRef] = useRoughSvg(
    (rc, width, h) => {
      const nodes: SVGElement[] = []
      nodes.push(
        rc.rectangle(1.5, 1.5, width - 3, h - 3, {
          stroke: outlineColor,
          strokeWidth: 1.4,
          roughness: 1.4,
          seed
        })
      )
      const fillWidth = Math.max(0, pct * width - 4)
      if (fillWidth > 1) {
        nodes.push(
          rc.rectangle(2.5, 2.5, fillWidth, h - 5, {
            fill: color,
            fillStyle: 'hachure',
            hachureGap: 3,
            fillWeight: 1.6,
            stroke: 'none',
            roughness: 1.2,
            seed: seed + 1
          })
        )
      }
      return nodes
    },
    [pct, color, outlineColor, height]
  )

  return (
    <div ref={containerRef} className={s.wrap} style={{ height }}>
      {glossy && <div className={s.gloss} />}
      <svg ref={svgRef} className={s.overlaySvg} />
    </div>
  )
}
