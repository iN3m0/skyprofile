/**
 * Converts a raw skill XP total into level/progress info, walking a
 * per-level XP table cumulatively. Simplified port of SkyCrypt's
 * `getLevelByXp` (src/stats/skills/leveling.js) — this app doesn't need
 * its leaderboard-rank or infinite-leveling options.
 */
export interface LevelProgress {
  xp: number
  level: number
  levelCap: number
  maxLevel: number
  xpCurrent: number
  xpForNext: number
  /** 0-1 fraction of the way to the next level. */
  progress: number
}

export function getLevelByXp(
  xp: number,
  xpTable: Record<number, number>,
  levelCap: number,
  maxLevel: number
): LevelProgress {
  const safeXp = typeof xp === 'number' && !Number.isNaN(xp) ? xp : 0

  let uncappedLevel = 0
  let xpCurrent = safeXp
  let xpRemaining = safeXp

  while (xpTable[uncappedLevel + 1] !== undefined && xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++
    xpRemaining -= xpTable[uncappedLevel]
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining
    }
  }

  const level = Math.min(levelCap, uncappedLevel)
  const xpForNext = level < maxLevel ? Math.ceil(xpTable[level + 1] ?? 0) : Infinity
  const progress =
    level >= maxLevel ? 0 : xpForNext > 0 ? Math.max(0, Math.min(Math.floor(xpCurrent) / xpForNext, 1)) : 0

  return {
    xp: safeXp,
    level,
    levelCap,
    maxLevel,
    xpCurrent: Math.floor(xpCurrent),
    xpForNext,
    progress
  }
}
