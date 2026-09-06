import type { SkillProgress, SkillsSummary } from '@shared/types/skills'
import type { RawHypixelMember } from '../hypixel/profileService'
import { getLevelByXp } from './leveling'
import { COSMETIC_SKILLS, SKILL_BASE_LEVEL, SKILL_FIELDS, SKILL_TRUE_MAX_LEVEL, getXpTable } from './constants'

/**
 * Farming and Taming cap below their true max until the player has
 * unlocked further levels with in-game currency, not just XP — see the
 * comment on `SKILL_TRUE_MAX_LEVEL`. `tamingAchievementCap` is the
 * player's `skyblock_domesticator` achievement value (from the `/player`
 * endpoint, resolved by the caller since it's a separate request from the
 * profile itself) — null when it couldn't be fetched, which just leaves
 * Taming at its base cap.
 */
function getSkillMaxLevel(
  key: string,
  member: RawHypixelMember,
  tamingAchievementCap: number | null
): number {
  if (key === 'farming') {
    const bonus = member.jacobs_contest?.perks?.farming_level_cap ?? 0
    return Math.min(SKILL_BASE_LEVEL.farming + bonus, SKILL_TRUE_MAX_LEVEL.farming)
  }
  if (key === 'taming') {
    return Math.min(
      Math.max(tamingAchievementCap ?? 0, SKILL_BASE_LEVEL.taming),
      SKILL_TRUE_MAX_LEVEL.taming
    )
  }
  return SKILL_TRUE_MAX_LEVEL[key]
}

export function computeSkills(
  member: RawHypixelMember,
  tamingAchievementCap: number | null = null
): SkillsSummary {
  const experience = member.player_data?.experience
  if (!experience) {
    return { apiEnabled: false, skills: [], averageSkillLevel: 0, totalSkillXp: 0 }
  }

  const skills: SkillProgress[] = Object.entries(SKILL_FIELDS).map(([key, field]) => {
    const xp = experience[field] ?? 0
    const maxLevel = getSkillMaxLevel(key, member, tamingAchievementCap)
    const progress = getLevelByXp(xp, getXpTable(key), maxLevel, maxLevel)
    return { key, ...progress }
  })

  const ranked = skills.filter((s) => !COSMETIC_SKILLS.includes(s.key))
  const averageSkillLevel = ranked.length
    ? ranked.reduce((total, s) => total + s.level + s.progress, 0) / ranked.length
    : 0
  const totalSkillXp = ranked.reduce((total, s) => total + s.xp, 0)

  return { apiEnabled: true, skills, averageSkillLevel, totalSkillXp }
}
