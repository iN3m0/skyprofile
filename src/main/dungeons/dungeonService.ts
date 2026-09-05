import type { DungeonClass, DungeonFloor, DungeonsSummary } from '@shared/types/dungeons'
import type { RawHypixelMember } from '../hypixel/profileService'
import { CATACOMBS_MAX_LEVEL, CATACOMBS_XP_THRESHOLDS, DUNGEON_CLASS_ORDER, titleCase } from './constants'

function getLevel(xp: number): { level: number; xpForNextLevel: number | null; progress: number } {
  let level = 0
  for (const threshold of CATACOMBS_XP_THRESHOLDS) {
    if (xp >= threshold) level++
  }
  const next = CATACOMBS_XP_THRESHOLDS[level]
  if (next === undefined) return { level, xpForNextLevel: null, progress: 1 }

  const prev = level > 0 ? CATACOMBS_XP_THRESHOLDS[level - 1] : 0
  const progress = Math.max(0, Math.min((xp - prev) / (next - prev), 1))
  return { level, xpForNextLevel: next - xp, progress }
}

function floorLabel(floor: number, master: boolean): string {
  if (floor === 0) return 'Entrance'
  const numeral = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][floor] ?? String(floor)
  return `${master ? 'Master' : 'Floor'} ${numeral}`
}

function buildFloors(
  tierCompletions: Record<string, number> | undefined,
  bestScore: Record<string, number> | undefined,
  fastestTime: Record<string, number> | undefined,
  master: boolean
): DungeonFloor[] {
  const floors: DungeonFloor[] = []
  const startFloor = master ? 1 : 0
  for (let floor = startFloor; floor <= 7; floor++) {
    const key = String(floor)
    // `tier_completions` only ever has a key for a floor that's been
    // cleared at least once — skip floors never completed, same "don't
    // pretend a never-attempted thing is a real 0/0 entry" approach used
    // for minion tiers/bestiary families elsewhere in this app.
    if (!tierCompletions || !(key in tierCompletions)) continue

    floors.push({
      floor,
      label: floorLabel(floor, master),
      completions: tierCompletions[key],
      bestScore: bestScore?.[key] ?? null,
      fastestTimeMs: fastestTime?.[key] ?? null
    })
  }
  return floors
}

export function computeDungeons(member: RawHypixelMember): DungeonsSummary {
  const raw = member.dungeons
  const catacombs = raw?.dungeon_types?.catacombs
  if (!raw || !catacombs) {
    return {
      apiEnabled: false,
      catacombsXp: 0,
      catacombsLevel: 0,
      catacombsMaxLevel: CATACOMBS_MAX_LEVEL,
      catacombsXpForNextLevel: null,
      catacombsProgress: 0,
      secretsFound: 0,
      highestFloorCompleted: null,
      normalFloors: [],
      masterFloors: [],
      classes: []
    }
  }

  const catacombsXp = catacombs.experience ?? 0
  const { level, xpForNextLevel, progress } = getLevel(catacombsXp)

  const master = raw.dungeon_types?.master_catacombs
  const normalFloors = buildFloors(catacombs.tier_completions, catacombs.best_score, catacombs.fastest_time, false)
  const masterFloors = buildFloors(master?.tier_completions, master?.best_score, master?.fastest_time, true)

  const classes: DungeonClass[] = DUNGEON_CLASS_ORDER.map((type) => {
    const xp = raw.player_classes?.[type]?.experience ?? 0
    const classLevel = getLevel(xp)
    return {
      type,
      name: titleCase(type),
      xp,
      level: classLevel.level,
      maxLevel: CATACOMBS_MAX_LEVEL,
      xpForNextLevel: classLevel.xpForNextLevel,
      progress: classLevel.progress,
      selected: raw.selected_dungeon_class === type
    }
  })

  return {
    apiEnabled: true,
    catacombsXp,
    catacombsLevel: level,
    catacombsMaxLevel: CATACOMBS_MAX_LEVEL,
    catacombsXpForNextLevel: xpForNextLevel,
    catacombsProgress: progress,
    secretsFound: raw.secrets ?? 0,
    highestFloorCompleted: catacombs.highest_tier_completed ?? null,
    normalFloors,
    masterFloors,
    classes
  }
}
