export type AttributeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface Attribute {
  /** Raw `member.attributes.stacks` key. */
  key: string
  displayName: string
  rarity: AttributeRarity
  family: string | null
  skill: string | null
  /** Plain-text description of what the attribute does, e.g. "Grants +2–20 Health" — shown so a player can tell what a level means without leaving the app. */
  effect: string | null
  owned: boolean
  stacks: number
  level: number
  maxLevel: number
  /** Shards needed to reach the next level — null once at max level. */
  stacksForNextLevel: number | null
}

/** An owned attribute whose raw key couldn't be matched to a known catalog entry — shown plainly (no level/rarity) rather than guessed. Expected to be empty in practice now that the catalog is keyed by Hypixel's own stable internal ids, kept as a defensive fallback for whatever the catalog hasn't caught up with yet. */
export interface UnclassifiedAttribute {
  key: string
  stacks: number
}

export interface AttributesSummary {
  /** false when the player has no attribute data available for this profile. */
  apiEnabled: boolean
  /** Every catalogued attribute, owned or not (owned ones carry real stacks/level; unowned show level 0). */
  attributes: Attribute[]
  unclassified: UnclassifiedAttribute[]
  ownedCount: number
  maxedCount: number
  totalCatalogued: number
}
