export type PetRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic'

export interface Pet {
  /** Stable per-pet identity from Hypixel, used as a React key — falls back to a generated one if absent. */
  uuid: string
  /** Raw Skyblock pet type id, e.g. "GOLDEN_DRAGON". */
  type: string
  /** Resolved display name, already accounting for rarity-based overrides and the Golden Dragon egg/hatching special case. */
  displayName: string
  rarity: PetRarity
  level: number
  maxLevel: number
  /** XP earned toward the next level (0 once maxed). */
  xpCurrent: number
  /** XP required for the next level (0 once maxed). */
  xpForNext: number
  /** 0–1 progress toward the next level (always 1 once maxed). */
  progress: number
  /** Total lifetime XP this pet has earned, across all levels. */
  totalXp: number
  active: boolean
  /** Raw held-item id, e.g. "PET_ITEM_TIER_BOOST". Null if nothing is held. */
  heldItem: string | null
  candyUsed: number
  /** Resolved icon URL (Mojang skin-texture head crop), when known. */
  headTextureUrl: string | null
  /** Which skill this pet's XP source/bonus is themed around ("combat", "mining", "all", etc). */
  skillType: string
  /** "Pet" unless overridden (e.g. "Mount", "Morph"). */
  category: string
  /** True for pets whose passive effects apply even when not the active/summoned pet. */
  passivePerks: boolean
}

export interface MissingPet {
  type: string
  /** Resolved at this type's own max tier, since a never-owned pet has no rarity of its own yet. */
  displayName: string
  rarity: PetRarity
  headTextureUrl: string | null
  category: string
}

export interface PetsSummary {
  /** false when the player has the relevant API access disabled for this profile. */
  apiEnabled: boolean
  pets: Pet[]
  /** Count of distinct pet *type groups* owned (a Wisp variant and its siblings count once, matching Hypixel's own dedup) — always equals totalTypeCount - missing.length. */
  ownedTypeCount: number
  /** ownedTypeCount + missing.length — every catalogued type group, owned or not. */
  totalTypeCount: number
  totalXp: number
  /** One entry per not-yet-owned pet *type group* (a Wisp family counts once, represented by its highest-max-tier sibling), sorted by that max tier descending. */
  missing: MissingPet[]
  /** https://hypixelskyblock.minecraft.wiki/w/Pet_Score — highest-rarity value per owned type, +1 per type maxed. */
  petScore: number
  /** Magic Find bonus unlocked by petScore, per the Pet Score reward table. */
  petScoreMagicFind: number
  totalCandyUsed: number
}
