export type Rarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'divine'
  | 'supreme'
  | 'special'
  | 'very_special'
  | 'admin'

export interface EnchantmentEntry {
  id: string
  level: number
}

export interface InventoryItem {
  slot: number
  /** Skyblock internal item id (tag.ExtraAttributes.id), e.g. "HYPERION". Null for plain vanilla items. */
  itemId: string | null
  /** Vanilla Minecraft item/block name resolved from the item's legacy numeric id, e.g. "diamond_sword". */
  vanillaId: string | null
  /** Raw display name, still carrying §-color codes — formatting is a renderer concern. */
  displayName: string
  /** Raw lore lines, still carrying §-color codes. */
  lore: string[]
  rarity: Rarity | null
  count: number
  enchantments: EnchantmentEntry[]
  /** Resolved icon, when we have one — same resolution used for collections (vanilla texture or custom head skin). */
  skinUrl: string | null
  /**
   * True when this item has been upgraded a rarity via the Recombobulator
   * 3000 (`ExtraAttributes.rarity_upgrades`). In-game this shows as an
   * obfuscated (§k) "a" flanking the rarity line, giving it a shimmering
   * look — mirrored here as a glossy shine effect rather than parsed from
   * that lore text, since the ExtraAttributes flag is the actual source
   * of truth and can't drift the way a text pattern could.
   */
  recombobulated: boolean
}

export interface InventoryContainer {
  key: string
  name: string
  items: InventoryItem[]
}

export interface MemberInventory {
  /** false when the player has Inventory API access disabled for this profile. */
  apiEnabled: boolean
  containers: InventoryContainer[]
}
