import type { SlayerActiveQuest, SlayerBoss, SlayerSummary } from '@shared/types/slayer'
import type { RawHypixelMember } from '../hypixel/profileService'
import { SLAYER_FANCY_NAMES, SLAYER_MAX_TIER, SLAYER_ORDER, SLAYER_XP_THRESHOLDS } from './constants'

function getSlayerLevel(
  xp: number,
  thresholds: number[]
): { level: number; xpForNextLevel: number | null; progress: number } {
  let level = 0
  for (const threshold of thresholds) {
    if (xp >= threshold) level++
  }
  const next = thresholds[level]
  if (next === undefined) return { level, xpForNextLevel: null, progress: 1 }

  const prev = level > 0 ? thresholds[level - 1] : 0
  const progress = Math.max(0, Math.min((xp - prev) / (next - prev), 1))
  return { level, xpForNextLevel: next - xp, progress }
}

/** `boss_kills_tier_0`..`_N` are 0-based (tier_0 = "Tier I" in-game) — reported 1-based here to match the Roman-numeral tiers players actually see. */
function sumKillsByTier(boss: Record<string, unknown>): { totalKills: number; killsByTier: Record<number, number> } {
  const killsByTier: Record<number, number> = {}
  let totalKills = 0
  for (const [key, value] of Object.entries(boss)) {
    const match = /^boss_kills_tier_(\d+)$/.exec(key)
    if (!match || typeof value !== 'number') continue
    const tier = Number(match[1]) + 1
    killsByTier[tier] = value
    totalKills += value
  }
  return { totalKills, killsByTier }
}

export function computeSlayer(member: RawHypixelMember): SlayerSummary {
  const raw = member.slayer
  if (!raw?.slayer_bosses) {
    return { apiEnabled: false, bosses: [], totalXp: 0, activeQuest: null }
  }

  const bosses: SlayerBoss[] = SLAYER_ORDER.map((type) => {
    const bossData = raw.slayer_bosses?.[type] ?? {}
    const xp = typeof bossData.xp === 'number' ? bossData.xp : 0
    const thresholds = SLAYER_XP_THRESHOLDS[type]
    const { level, xpForNextLevel, progress } = getSlayerLevel(xp, thresholds)
    const { totalKills, killsByTier } = sumKillsByTier(bossData)

    return {
      type,
      fancyName: SLAYER_FANCY_NAMES[type] ?? type,
      xp,
      level,
      maxLevel: thresholds.length,
      xpForNextLevel,
      progress,
      highestTier: SLAYER_MAX_TIER[type] ?? 0,
      killsByTier,
      totalKills
    }
  })

  const quest = raw.slayer_quest
  const activeQuest: SlayerActiveQuest | null = quest?.type
    ? {
        type: quest.type,
        fancyName: SLAYER_FANCY_NAMES[quest.type] ?? quest.type,
        tier: (quest.tier ?? 0) + 1,
        completionState: quest.completion_state ?? 0
      }
    : null

  return {
    apiEnabled: true,
    bosses,
    totalXp: bosses.reduce((sum, b) => sum + b.xp, 0),
    activeQuest
  }
}
