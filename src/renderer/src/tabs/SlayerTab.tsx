import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import { formatPrice } from '../lib/formatPrice'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './SlayerTab.module.css'

// Standard Minecraft chat colors, matching the §-codes Hypixel itself
// uses for slayer tier numerals (§a §e §c §4 §5) — tier 1 first.
const TIER_COLORS = ['#55FF55', '#FFFF55', '#FF5555', '#AA0000', '#AA00AA']

function toRoman(n: number): string {
  return ['', 'I', 'II', 'III', 'IV', 'V'][n] ?? String(n)
}

export default function SlayerTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['slayer', profileId, uuid],
    queryFn: () => api.member.getSlayer(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={6} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load slayer.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return <p className={`font-hand ${s.emptyState}`}>this player has no slayer data available for this profile.</p>
  }

  const { bosses, totalXp, activeQuest } = query.data

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Total Slayer XP</span>
            <span className={`font-tabular ${s.statValue}`}>{formatPrice(totalXp)}</span>
          </div>
        </SketchBox>
        {activeQuest && (
          <SketchBox className={s.statBox} stroke="var(--color-progress)" strokeWidth={1.4} roughness={1.3}>
            <div className={s.statBoxContent}>
              <span className={`font-hand ${s.statLabel}`}>Active Quest</span>
              <span className={`font-hand ${s.questValue}`}>
                {activeQuest.fancyName} · Tier {toRoman(activeQuest.tier)}
              </span>
            </div>
          </SketchBox>
        )}
      </div>

      <div className={s.grid}>
        {bosses.map((boss, i) => {
          const color = MARKER_COLORS[i % MARKER_COLORS.length]
          const maxed = boss.level >= boss.maxLevel
          return (
            <div key={boss.type} className={s.card}>
              <div className={s.cardHeader}>
                <span className={`font-hand ${s.bossName}`} style={{ color }}>
                  {boss.fancyName}
                </span>
                <span className={`font-tabular ${s.bossMeta}`}>
                  {maxed ? `Lv ${boss.level}` : `Lv ${boss.level}/${boss.maxLevel}`}
                </span>
              </div>
              <div className={maxed ? s.maxedBar : undefined}>
                <SketchProgress progress={maxed ? 1 : boss.progress} color={color} outlineColor={color} height={10} />
              </div>
              <p className={`font-tabular ${s.xpLine}`}>
                {formatPrice(boss.xp)} XP
                {!maxed && boss.xpForNextLevel !== null && ` · ${formatPrice(boss.xpForNextLevel)} to next level`}
              </p>
              <div className={s.tierRow}>
                {Array.from({ length: boss.highestTier }, (_, tierIndex) => {
                  const tier = tierIndex + 1
                  const kills = boss.killsByTier[tier] ?? 0
                  return (
                    <span key={tier} className={s.tierBadge} style={{ color: TIER_COLORS[tierIndex] }}>
                      {toRoman(tier)}: {kills.toLocaleString()}
                    </span>
                  )
                })}
              </div>
              <p className={`font-tabular ${s.totalKills}`}>{boss.totalKills.toLocaleString()} total kills</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
