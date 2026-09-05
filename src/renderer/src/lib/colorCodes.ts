/**
 * Parses Minecraft `§`-formatted text (item names/lore, straight off the
 * NBT — untrusted, player/Hypixel-controlled content) into styled runs.
 * Rendered as individual <span> elements by the caller, never via
 * dangerouslySetInnerHTML.
 */
export interface TextRun {
  text: string
  color: string
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
}

const COLORS: Record<string, string> = {
  '0': '#000000',
  '1': '#0000AA',
  '2': '#00AA00',
  '3': '#00AAAA',
  '4': '#AA0000',
  '5': '#AA00AA',
  '6': '#FFAA00',
  '7': '#AAAAAA',
  '8': '#555555',
  '9': '#5555FF',
  a: '#55FF55',
  b: '#55FFFF',
  c: '#FF5555',
  d: '#FF55FF',
  e: '#FFFF55',
  f: '#FFFFFF'
}

const DEFAULT_COLOR = COLORS.f

export function parseMinecraftText(raw: string): TextRun[] {
  const runs: TextRun[] = []
  let color = DEFAULT_COLOR
  let bold = false
  let italic = false
  let underline = false
  let strikethrough = false
  let buffer = ''

  const flush = (): void => {
    if (buffer) runs.push({ text: buffer, color, bold, italic, underline, strikethrough })
    buffer = ''
  }

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch === '§' && i + 1 < raw.length) {
      const code = raw[i + 1].toLowerCase()
      if (COLORS[code]) {
        flush()
        color = COLORS[code]
        bold = italic = underline = strikethrough = false
      } else if (code === 'l') {
        flush()
        bold = true
      } else if (code === 'o') {
        flush()
        italic = true
      } else if (code === 'n') {
        flush()
        underline = true
      } else if (code === 'm') {
        flush()
        strikethrough = true
      } else if (code === 'r') {
        flush()
        color = DEFAULT_COLOR
        bold = italic = underline = strikethrough = false
      }
      // 'k' (obfuscated/scrambled) is a no-op here — not worth animating for a stats viewer.
      i++
      continue
    }
    buffer += ch
  }
  flush()
  return runs
}
