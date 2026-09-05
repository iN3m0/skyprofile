import type { SkillProgress, SkillsSummary } from '@shared/types/skills'
import type { RawHypixelMember } from '../hypixel/profileService'
import { getLevelByXp } from './leveling'
import { COSMETIC_SKILLS, SKILL_FIELDS, SKILL_MAX_LEVEL, getXpTable } from './constants'

export function computeSkills(member: RawHypixelMember): SkillsSummary {
  const experience = member.player_data?.experience
  if (!experience) {
    return { apiEnabled: false, skills: [], averageSkillLevel: 0, totalSkillXp: 0 }
  }

  const skills: SkillProgress[] = Object.entries(SKILL_FIELDS).map(([key, field]) => {
    const xp = experience[field] ?? 0
    const maxLevel = SKILL_MAX_LEVEL[key]
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
