import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import SketchProgress from '../components/sketch/SketchProgress'
import SkillIcon from '../components/icons/SkillIcon'
import { SkeletonRows } from '../components/Skeleton'
import { getSkillColor } from '../lib/skillColors'
import s from './SkillsTab.module.css'

const SKILL_LABELS: Record<string, string> = {
  farming: 'Farming',
  mining: 'Mining',
  combat: 'Combat',
  foraging: 'Foraging',
  fishing: 'Fishing',
  enchanting: 'Enchanting',
  alchemy: 'Alchemy',
  taming: 'Taming',
  carpentry: 'Carpentry',
  runecrafting: 'Runecrafting',
  social: 'Social',
  hunting: 'Hunting'
}

export default function SkillsTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['skills', profileId, uuid],
    queryFn: () => api.member.getSkills(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load skills.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has skills api access disabled — can't show levels for them.
      </p>
    )
  }

  return (
    <div>
      <p className={`font-hand ${s.summary}`}>
        avg skill level: <span className={s.summaryValue}>{query.data.averageSkillLevel.toFixed(2)}</span>
      </p>
      <div className={s.grid}>
        {query.data.skills.map((skill) => {
          const maxed = skill.level >= skill.maxLevel
          // Taming's cap is per-player (see skillsService.ts) — someone
          // capped at 50 because they haven't given pets to George yet is
          // "maxed" for display purposes (no XP counter to show), but
          // hasn't actually finished the skill, so the shine only shows at
          // the true ceiling of 60, not their current cap.
          const showGloss = maxed && (skill.key !== 'taming' || skill.level >= 60)
          // The skill's own color is its identity — icon, name, and bar all
          // stay this color whether maxed or not. A maxed bar gets a glossy
          // highlight instead, so "maxed" reads as a finish/shine rather
          // than swapping to an unrelated color.
          const color = getSkillColor(skill.key)
          return (
            <div key={skill.key} className={s.row}>
              <span className={s.iconBadge} style={{ backgroundColor: color }}>
                <SkillIcon skill={skill.key} size={18} />
              </span>
              <div className={s.rowBody}>
                <div className={s.rowHeader}>
                  <span className={`font-hand ${s.skillName}`} style={{ color }}>
                    {SKILL_LABELS[skill.key] ?? skill.key}
                  </span>
                  <span className={`font-tabular ${s.skillMeta}`}>
                    {maxed
                      ? `Lv ${skill.level}`
                      : `Lv ${skill.level} · ${skill.xpCurrent.toLocaleString()}/${skill.xpForNext.toLocaleString()}`}
                  </span>
                </div>
                <div className={showGloss ? s.maxedBar : undefined}>
                  <SketchProgress progress={maxed ? 1 : skill.progress} color={color} outlineColor={color} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
