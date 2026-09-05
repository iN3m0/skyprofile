import type { SkillProgress, SkillsSummary } from '@shared/types/skills'
import type { RawHypixelMember } from '../hypixel/profileService'
import { getLevelByXp } from './leveling'
import { COSMETIC_SKILLS, DEFAULT_SKILL_CAPS, MAXED_SKILL_CAPS, SKILL_FIELDS, getXpTable } from './constants'

export function computeSkills(member: RawHypixelMember): SkillsSummary {
  const experience = member.player_data?.experience
  if (!experience) {
    return { apiEnabled: false, skills: [], averageSkillLevel: 0, totalSkillXp: 0 }
  }

  const skills: SkillProgress[] = Object.entries(SKILL_FIELDS).map(([key, field]) => {
    const xp = experience[field] ?? 0
    const levelCap = DEFAULT_SKILL_CAPS[key]
    const maxLevel = MAXED_SKILL_CAPS[key] ?? levelCap
    const progress = getLevelByXp(xp, getXpTable(key), levelCap, maxLevel)
    return { key, ...progress }
  })

  const ranked = skills.filter((s) => !COSMETIC_SKILLS.includes(s.key))
  const averageSkillLevel = ranked.length
    ? ranked.reduce((total, s) => total + s.level + s.progress, 0) / ranked.length
    : 0
  const totalSkillXp = ranked.reduce((total, s) => total + s.xp, 0)

  return { apiEnabled: true, skills, averageSkillLevel, totalSkillXp }
}
