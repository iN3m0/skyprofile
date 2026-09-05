import { useEffect, useRef, useState } from 'react'
import rough from 'roughjs'
import type { RoughSVG } from 'roughjs/bin/svg'

/**
 * Draws hand-wobbled rough.js shapes into an SVG positioned behind normal
 * DOM content, instead of using CSS `border` — this is the actual
 * "sketched" look (real ink-style jitter, hachure fills) rather than a
 * clean rounded-rectangle dashboard card. Redraws on resize; the seed is
 * stable across re-renders so a box doesn't re-jitter on every state
 * change, only when its size actually changes.
 */
export function useRoughSvg<T extends HTMLElement = HTMLDivElement>(
  draw: (rc: RoughSVG, width: number, height: number) => SVGElement[],
  deps: unknown[] = []
): [React.RefObject<T | null>, React.RefObject<SVGSVGElement | null>] {
  const containerRef = useRef<T>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      // Read the element's own border-box size rather than
      // ResizeObserver's `contentRect` (which excludes padding) — the SVG
      // overlay spans the full padded box via width/height:100%, so the
      // rough shape needs to be sized to match that, not just the content
      // area. This matters most for SketchButton, whose padding lives
      // directly on the measured element.
      const width = el.offsetWidth
      const height = el.offsetHeight
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }))
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const svg = svgRef.current
    if (!svg || size.width === 0 || size.height === 0) return
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    const rc = rough.svg(svg)
    for (const node of draw(rc, size.width, size.height)) {
      svg.appendChild(node)
    }
    // `draw` is expected to be referentially stable-ish (defined inline is
    // fine) — redraw is driven explicitly by size plus the caller's `deps`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width, size.height, ...deps])

  return [containerRef, svgRef]
}
