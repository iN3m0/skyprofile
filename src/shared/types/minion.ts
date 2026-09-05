export interface Minion {
  type: string
  name: string
  category: string
  tier: number
  maxTier: number
  headTextureUrl: string | null
}

export interface MissingMinion {
  type: string
  name: string
  category: string
  maxTier: number
  headTextureUrl: string | null
}

export interface MinionsSummary {
  /** false when the player has no crafted-minion data available for this profile. */
  apiEnabled: boolean
  minions: Minion[]
  missing: MissingMinion[]
  /** Distinct minion types with at least tier 1 crafted. */
  uniqueMinions: number
  maxedMinions: number
  totalTypes: number
  /** Current total placeable slots from the crafted-minions table alone (starts at 5, grows as more unique type+tier combos are crafted) — separate from bonusMinionSlots. */
  craftedMinionSlots: number
  /** Unique minions still needed to reach the next crafted-slot tier — null once at the table's max tier. */
  uniqueMinionsToNextSlot: number | null
  /** Community Shop "Minion Slots" profile upgrade tier reached (0–5), entirely separate from craftedMinionSlots. */
  bonusMinionSlots: number
  maxBonusMinionSlots: number
}
