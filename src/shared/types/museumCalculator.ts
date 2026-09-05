import type { Rarity } from './item'

/** One row of the Museum Calculator — an undonated item, its SkyBlock XP, and the cheapest way to get it. */
export interface MuseumCalculatorEntry {
  itemId: string
  name: string
  rarity: Rarity | null
  category: string
  /** SkyBlock XP granted on donation. */
  xp: number
  /** Cheapest of buying directly (AH/bazaar) or crafting from sub-ingredients — null if neither is priced. */
  cost: number | null
  /** Where `cost` came from. */
  costSource: 'buy' | 'craft' | null
  /** cost / xp — what this tool ranks by. */
  costPerXp: number | null
}

export interface MuseumCalculatorSummary {
  /** false when this profile has no museum data available. */
  apiEnabled: boolean
  /** Every undonated, XP-granting item, cheapest cost-per-XP first (no-price ones last). */
  entries: MuseumCalculatorEntry[]
}
