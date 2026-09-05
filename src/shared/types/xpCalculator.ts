/** Where one SkyBlock XP Calculator row's opportunity comes from. */
export type XpSource = 'museum' | 'accessories' | 'bank' | 'minions' | 'pets' | 'essence'

/** One way to spend coins on SkyBlock XP. */
export interface SkyblockXpEntry {
  source: XpSource
  /** Real Hypixel item id, for icon lookup — null for Bank Upgrades and Pets (neither has an item-style icon). */
  itemId: string | null
  name: string
  category: string | null
  /**
   * SkyBlock XP this represents. For a discrete one-time reward (a Museum
   * donation, a Bank Upgrade tier) this is the real fixed amount. For
   * Accessories it's always 1 — Magical Power converts 1:1 to SkyBlock XP
   * via the "Accessory Bag Upgrades" task, so each entry here already
   * represents the cost of one marginal point.
   */
  xp: number
  /** Total coins for this entry (or, for accessories, the cost of that one marginal XP) — null if unpriced. */
  cost: number | null
  /** cost / xp — what this tool ranks by. */
  costPerXp: number | null
}

/** A real SkyBlock XP source this calculator doesn't (yet, or ever) price — shown so the omission is a stated fact, not a silent gap. */
export interface ExcludedXpSource {
  name: string
  reason: string
}

export interface SkyblockXpCalculatorSummary {
  /** false when this profile's accessories/museum data isn't available. */
  apiEnabled: boolean
  /** Every priced entry, cheapest cost-per-XP first (no-price ones last). */
  entries: SkyblockXpEntry[]
  excludedSources: ExcludedXpSource[]
}
