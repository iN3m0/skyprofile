import { parseMinecraftText } from '../lib/colorCodes'

export default function MinecraftText({
  text,
  className
}: {
  text: string
  className?: string
}): React.JSX.Element {
  const runs = parseMinecraftText(text)
  return (
    <span className={className}>
      {runs.map((run, i) => (
        <span
          key={i}
          style={{
            color: run.color,
            fontWeight: run.bold ? 700 : undefined,
            fontStyle: run.italic ? 'italic' : undefined,
            textDecoration:
              [run.underline && 'underline', run.strikethrough && 'line-through'].filter(Boolean).join(' ') ||
              undefined
          }}
        >
          {run.text}
        </span>
      ))}
    </span>
  )
}
