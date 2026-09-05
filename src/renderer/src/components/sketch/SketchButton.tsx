import { useState } from 'react'
import { useRoughSvg } from './useRoughSvg'
import s from './sketch.module.css'

let seedCounter = 9000

export default function SketchButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'default',
  color,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
  /** Overrides the variant's stroke/text color with an explicit one (e.g. a per-skill color). */
  color?: string
  className?: string
}): React.JSX.Element {
  const [seed] = useState(() => seedCounter++)

  const stroke =
    color ??
    (variant === 'primary'
      ? 'var(--color-accent)'
      : variant === 'danger'
        ? 'var(--color-rarity-special)'
        : 'var(--color-ink)')

  const [containerRef, svgRef] = useRoughSvg<HTMLButtonElement>(
    (rc, width, height) => {
      const inset = 2
      return [
        rc.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
          stroke,
          strokeWidth: variant === 'primary' || color ? 2.4 : 1.75,
          roughness: 1.7,
          seed,
          fillStyle: 'hachure'
        })
      ]
    },
    [stroke, variant]
  )

  const textColorClass = color
    ? ''
    : variant === 'primary'
      ? s.textPrimary
      : variant === 'danger'
        ? s.textDanger
        : s.textDefault

  return (
    <button
      ref={containerRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${s.button} ${textColorClass} ${className}`}
      style={color ? { color } : undefined}
    >
      <svg ref={svgRef} className={s.overlaySvg} />
      <span className={s.buttonLabel}>{children}</span>
    </button>
  )
}
