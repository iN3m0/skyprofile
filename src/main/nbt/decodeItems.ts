import nbt from 'prismarine-nbt'
import minecraftData from 'minecraft-data'
import type { InventoryItem } from '@shared/types/item'
import { parseRarityFromLore } from './rarity'

// Hypixel's item NBT still uses Minecraft's legacy pre-1.13 numeric ids
// (the `id` field here, not to be confused with Skyblock's own
// ExtraAttributes.id) — 1.8.9 is the last version those numeric ids map
// against, same version SkyCrypt itself resolves them with.
const mcData = minecraftData('1.8.9')

interface RawNbtItem {
  id?: number
  Count?: number
  tag?: {
    display?: { Name?: string; Lore?: string[] }
    ExtraAttributes?: {
      id?: string
      enchantments?: Record<string, number>
      rarity_upgrades?: number
    }
  }
}

/**
 * Decodes one base64+gzip NBT inventory blob (the shape every inventory
 * field on a Hypixel profile member uses — `inv_contents.data`,
 * `inv_armor.data`, etc.) into normalized items. Empty/air slots are
 * skipped entirely — callers that need exact slot positions preserved
 * would need `slot` on the returned items, which we do keep, so a caller
 * can still lay them out precisely if it wants to later.
 *
 * `prismarine-nbt` auto-detects gzip and endianness, but Hypixel's NBT is
 * always standard Java (big-endian), so we pass that explicitly rather
 * than pay for/risk the auto-detect trial-and-error.
 */
export async function decodeInventoryData(base64: string): Promise<InventoryItem[]> {
  const buffer = Buffer.from(base64, 'base64')
  const { parsed } = await nbt.parse(buffer, 'big')
  const simplified = nbt.simplify(parsed) as { i: RawNbtItem[] }

  const items: InventoryItem[] = []
  simplified.i.forEach((raw, slot) => {
    const normalized = normalizeItem(raw, slot)
    if (normalized) items.push(normalized)
  })
  return items
}

function normalizeItem(raw: RawNbtItem, slot: number): InventoryItem | null {
  // id 0 (air) or a missing tag entirely is Minecraft's way of representing
  // an empty inventory slot in this list.
  if (!raw.id || raw.id === 0) return null

  const displayName = raw.tag?.display?.Name ?? ''
  const lore = raw.tag?.display?.Lore ?? []
  const extra = raw.tag?.ExtraAttributes

  const enchantments = extra?.enchantments
    ? Object.entries(extra.enchantments).map(([id, level]) => ({ id, level }))
    : []

  return {
    slot,
    itemId: extra?.id ?? null,
    vanillaId: mcData.items[raw.id]?.name ?? null,
    displayName,
    lore,
    rarity: parseRarityFromLore(lore),
    count: raw.Count ?? 1,
    enchantments,
    skinUrl: null,
    recombobulated: Boolean(extra?.rarity_upgrades)
  }
}
