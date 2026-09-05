import type { Rarity } from '@shared/types/item'

/**
 * Rarity list and lore-parsing approach ported from SkyCrypt
 * (common/constants/items.js, src/helper.js `parseItemTypeFromLore`).
 */
export const RARITIES: Rarity[] = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'divine',
  'supreme',
  'special',
  'very_special',
  'admin'
]

const RARITY_NAMES = RARITIES.map((r) => r.replaceAll('_', ' ').toUpperCase())

/**
 * Hypixel embeds an item's rarity as text in (usually) the last lore line,
 * e.g. "§9RARE SWORD" or "§6§lLEGENDARY". Search from the end since that's
 * where it reliably lives; strip color codes first so the text match is
 * clean. Simplified from SkyCrypt's regex — we only need the rarity itself
 * here, not category/recombobulated/dungeon detection.
 */
export function parseRarityFromLore(lore: string[]): Rarity | null {
  for (let i = lore.length - 1; i >= 0; i--) {
    const stripped = lore[i]
      .replace(/§./g, '')
      .trim()
      .toUpperCase()
    if (!stripped) continue
    for (let r = RARITY_NAMES.length - 1; r >= 0; r--) {
      if (stripped.startsWith(RARITY_NAMES[r]) || stripped.includes(` ${RARITY_NAMES[r]}`)) {
        return RARITIES[r]
      }
    }
  }
  return null
}
