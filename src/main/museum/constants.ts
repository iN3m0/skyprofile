import museumData from './data/museum.json'
import armorSetDisplayIdsData from './data/armorSetDisplayIds.json'

export const MUSEUM_CATEGORY_ITEMS = museumData as Record<string, string[]>

/**
 * Some catalog ids (141 of 636 — mostly Combat armor sets, e.g. "MELON",
 * "STARLIGHT") aren't real Hypixel item ids at all: they're NEU/SkyCrypt's
 * own base identifier for a 4-piece armor *set*, matching the real museum
 * donation data's own key (confirmed live: a donated Starlight-set piece
 * shows up as the bare key `STARLIGHT`, not e.g. `STARLIGHT_HELMET`) — so
 * `MUSEUM_CATEGORY_ITEMS`' ids are correct as-is for donation-matching and
 * for `data/museumXp.json` (also keyed by these same base ids). But
 * looking one of these ids up in Hypixel's real item resource, or a price
 * list, or a crafting-recipe map resolves to nonsense (`MELON` really is a
 * separate, real, unrelated item — the crop drop — not the armor set) —
 * for *those* purposes, resolve through this map first, e.g.
 * `resolveMuseumDisplayId('MELON') === 'MELON_HELMET'`, a real representative
 * piece of that set. Ported from NEU-REPO's `constants/museum.json` →
 * `armor_to_id`.
 */
const ARMOR_SET_DISPLAY_IDS = armorSetDisplayIdsData as Record<string, string>

export function resolveMuseumDisplayId(itemId: string): string {
  return ARMOR_SET_DISPLAY_IDS[itemId] ?? itemId
}

/**
 * For an *undonated* armor-set slot, `resolveMuseumDisplayId`'s piece is
 * only meant to stand in for pricing/icon purposes — showing its own real
 * name is misleading two ways at once: it reads as one specific piece
 * ("Tater Helmet") rather than the whole set the slot represents, and
 * pieces of the same set don't even share a family name (verified against
 * NEU-REPO's `sets_to_items`: Crimson Hunter's four pieces are
 * `BLAZE_BELT`/`GHAST_CLOAK`/`GLOWSTONE_GAUNTLET`/`MAGMA_NECKLACE` — no
 * shared word to strip a "piece type" suffix from). Title-casing the
 * catalog's own base id instead ("Melon" → "Melon Armor") sidesteps both:
 * it's always a real reference to the actual set, never a specific piece.
 * Returns null for a normal (non-set) id, which should just use its own
 * real name.
 */
export function getMuseumSetDisplayName(baseId: string): string | null {
  if (!(baseId in ARMOR_SET_DISPLAY_IDS)) return null
  const titleCased = baseId
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  return `${titleCased} Armor`
}

export const MUSEUM_CATEGORY_NAMES: Record<string, string> = {
  combat: 'Combat',
  farming: 'Farming',
  mining: 'Mining',
  fishing: 'Fishing',
  foraging: 'Foraging',
  dungeoneering: 'Dungeoneering',
  hunting: 'Hunting',
  special: 'Special'
}

/** Display order — matches the order Hypixel's own museum menu shows these in. */
export const MUSEUM_CATEGORY_ORDER = [
  'combat',
  'farming',
  'mining',
  'fishing',
  'foraging',
  'dungeoneering',
  'hunting',
  'special'
]
