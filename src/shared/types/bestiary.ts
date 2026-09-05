export interface MobFamily {
  name: string
  /** Resolved icon URL (Mojang skin-texture head crop), when known. */
  headTextureUrl: string | null
  kills: number
  /** Kill count required to reach the *next* tier — null once maxed. */
  nextTierKills: number | null
  /** Kill count required for this family's own highest tier. */
  maxKills: number
  tier: number
  maxTier: number
}

export interface BestiaryCategory {
  name: string
  headTextureUrl: string | null
  /** Present for the handful of categories with a further subcategory layer (e.g. Critter Safari's biomes) — flattened into `families` either way, kept here only for a subheading in the UI. */
  subcategoryName: string | null
  families: MobFamily[]
}

export interface BestiarySummary {
  /** false when the player has bestiary data unavailable for this profile (kills field absent). */
  apiEnabled: boolean
  categories: BestiaryCategory[]
  /** Sum of every family's current tier — matches Hypixel's own `bestiary.milestone.last_claimed_milestone`. */
  milestone: number
  /** Sum of every family's max tier — the theoretical ceiling. */
  maxMilestone: number
  /** Families with at least one kill. */
  familiesUnlocked: number
  /** Families at their own max tier. */
  familiesMaxed: number
  totalFamilies: number
}
