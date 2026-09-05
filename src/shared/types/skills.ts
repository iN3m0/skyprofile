export interface SkillProgress {
  key: string
  level: number
  levelCap: number
  maxLevel: number
  xp: number
  xpCurrent: number
  /** Infinity when already at max level. */
  xpForNext: number
  progress: number
}

export interface SkillsSummary {
  /** false when the player has Skills API access disabled for this profile. */
  apiEnabled: boolean
  skills: SkillProgress[]
  averageSkillLevel: number
  totalSkillXp: number
}
