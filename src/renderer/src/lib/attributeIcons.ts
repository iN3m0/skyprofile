/**
 * Per-attribute head-render icons (see src/renderer/src/assets/attributes/README.md
 * for provenance) — keyed directly by each attribute's stable internal key
 * (the filename itself), so no separate id-mapping manifest is needed at
 * runtime the way the Hypixel+ icon set needs one.
 */
const ATTRIBUTE_ICON_URLS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/attributes/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
      string,
      string
    >
  ).map(([path, url]) => [path.replace('../assets/attributes/', '').replace('.png', ''), url])
)

export function getAttributeIconUrl(key: string): string | null {
  return ATTRIBUTE_ICON_URLS[key] ?? null
}
