import type { Rarity } from './item'

export interface AccessoryListing {
  itemId: string
  name: string
  rarity: Rarity | null
  /** Lowest known price (coins), or null if we have no price data for it. */
  price: number | null
  /** floor(price / magical power granted) — null whenever price is. */
  costPerMp: number | null
}

export interface AccessoryUpgrade extends AccessoryListing {
  fromItemId: string
  fromName: string
}

/**
 * One row of the MP Calculator's ranked list — a clone of SkyHelper's
 * `/missing` command: every way to spend coins on Magical Power, sorted by
 * cost per point. Combines plain missing/upgrade accessories, the handful
 * of multi-rarity "custom price" items (Pulse Ring, Power Artifact, ...),
 * and synthetic "Recombobulate N accessories" bands into one list.
 */
export interface MpCalculatorEntry {
  /** Null only for a synthetic Recombobulator band, which isn't one item. */
  itemId: string | null
  name: string
  rarity: Rarity | null
  price: number | null
  costPerMp: number | null
  /** Set for the multi-rarity items (Pulse Ring, ...) — renders as "{name} Upgrade". */
  isMultiRarityUpgrade?: boolean
  /** Set only for a "Recombobulate N accessories" band — N is this value. */
  recombobulateCount?: number
}

export interface AccessoriesSummary {
  /** false when the player has Inventory API access disabled for this profile. */
  apiEnabled: boolean
  /** Owned accessory-bag contents — the actual items, same shape used elsewhere. */
  owned: import('./item').InventoryItem[]
  /** Accessories not owned at any tier, ascending price, no-price ones last. */
  missing: AccessoryListing[]
  /** Owned accessories with a higher tier available, ascending price of the upgrade, no-price ones last. */
  upgrades: AccessoryUpgrade[]
  /** The MP Calculator's ranked list — see `MpCalculatorEntry`. Ascending cost-per-MP, no-price ones last. */
  mpCalculator: MpCalculatorEntry[]
}
