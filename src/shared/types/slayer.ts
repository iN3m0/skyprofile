export interface SlayerBoss {
  /** Raw type key, e.g. "zombie". */
  type: string
  fancyName: string
  xp: number
  level: number
  maxLevel: number
  /** XP needed to reach the next level — null once at max level. */
  xpForNextLevel: number | null
  /** 0–1 progress toward the next level (always 1 once maxed). */
  progress: number
  /** Highest tier this slayer can be fought at (separate from XP level). */
  highestTier: number
  /** 1-based tier -> kill count, only for tiers with at least one attempt. */
  killsByTier: Record<number, number>
  totalKills: number
}

export interface SlayerActiveQuest {
  type: string
  fancyName: string
  /** 1-based, e.g. 4 for "Tier IV". */
  tier: number
  /** Hypixel's raw completion_state: 0 = in progress/unclaimed, 1 = complete, 2 = claimed. */
  completionState: number
}

export interface SlayerSummary {
  /** false when the player has no slayer data available for this profile. */
  apiEnabled: boolean
  bosses: SlayerBoss[]
  totalXp: number
  activeQuest: SlayerActiveQuest | null
}
