/**
 * Renders just the front-face region of a Mojang skin texture as a small
 * icon — used for custom Skyblock items implemented as player heads with
 * a custom skin (no vanilla item equivalent). The face is always an 8x8
 * region at a fixed offset in the skin sheet, so this crops with plain
 * CSS (scale the whole image up, then clip it inside a small window)
 * rather than needing any image-processing library.
 */
export default function HeadIcon({
  skinUrl,
  size = 18
}: {
  skinUrl: string
  size?: number
}): React.JSX.Element {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0
      }}
    >
      <img
        src={skinUrl}
        alt=""
        style={{
          position: 'absolute',
          left: -size,
          top: -size,
          width: size * 8,
          height: size * 8,
          imageRendering: 'pixelated'
        }}
      />
    </span>
  )
}
