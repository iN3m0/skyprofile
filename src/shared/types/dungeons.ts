export interface DungeonFloor {
  /** 0 = Entrance (normal mode only), 1-7 = Floor/Master I-VII. */
  floor: number
  label: string
  completions: number
  bestScore: number | null
  fastestTimeMs: number | null
}

export interface DungeonClass {
  type: string
  name: string
  xp: number
  level: number
  maxLevel: number
  xpForNextLevel: number | null
  progress: number
  selected: boolean
}

export interface DungeonsSummary {
  /** false when the player has no dungeons data available for this profile. */
  apiEnabled: boolean
  catacombsXp: number
  catacombsLevel: number
  catacombsMaxLevel: number
  catacombsXpForNextLevel: number | null
  catacombsProgress: number
  secretsFound: number
  highestFloorCompleted: number | null
  normalFloors: DungeonFloor[]
  masterFloors: DungeonFloor[]
  classes: DungeonClass[]
}
