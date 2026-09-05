import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import HeadIcon from '../components/HeadIcon'
import { MARKER_COLORS } from '../lib/skillColors'
import { formatPrice } from '../lib/formatPrice'
import s from './BestiaryTab.module.css'

export default function BestiaryTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['bestiary', profileId, uuid],
    queryFn: () => api.member.getBestiary(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load bestiary.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has no bestiary data available for this profile.
      </p>
    )
  }

  const { categories, milestone, maxMilestone, familiesUnlocked, familiesMaxed, totalFamilies } = query.data

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Milestone</span>
            <span className={`font-tabular ${s.statValue}`}>
              {milestone} / {formatPrice(maxMilestone)}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="var(--color-progress)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Families Unlocked</span>
            <span className={`font-tabular ${s.statValue}`}>
              {familiesUnlocked} / {totalFamilies}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e8a33d" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Families Maxed</span>
            <span className={`font-tabular ${s.statValue}`}>
              {familiesMaxed} / {totalFamilies}
            </span>
          </div>
        </SketchBox>
      </div>

      <nav className={s.jumpNav}>
        {categories.map((category, i) => (
          <button
            key={`nav-${category.name}-${category.subcategoryName ?? ''}`}
            type="button"
            className={`font-hand ${s.jumpLink}`}
            style={{ color: MARKER_COLORS[i % MARKER_COLORS.length] }}
            onClick={() =>
              document.getElementById(`bestiary-cat-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            {category.name}
            {category.subcategoryName && ` — ${category.subcategoryName}`}
          </button>
        ))}
      </nav>

      {categories.map((category, i) => {
        const color = MARKER_COLORS[i % MARKER_COLORS.length]
        return (
          <div
            key={`${category.name}-${category.subcategoryName ?? ''}`}
            id={`bestiary-cat-${i}`}
            className={s.categorySection}
          >
            <h2 className={`font-hand ${s.sectionTitle}`} style={{ color }}>
              {category.name}
              {category.subcategoryName && <span className={s.subcategoryName}> — {category.subcategoryName}</span>}
            </h2>
            <div className={s.grid}>
              {category.families.map((family) => {
                const maxed = family.tier >= family.maxTier
                const progress =
                  family.tier >= family.maxTier
                    ? 1
                    : Math.max(
                        0,
                        Math.min(
                          family.nextTierKills
                            ? family.kills / family.nextTierKills
                            : 1,
                          1
                        )
                      )
                return (
                  <div key={family.name} className={s.row}>
                    <SketchBox stroke={color} strokeWidth={1.5} roughness={1.4} className={s.box}>
                      <div className={s.boxContent}>
                        {family.headTextureUrl ? (
                          <HeadIcon skinUrl={family.headTextureUrl} size={26} />
                        ) : (
                          <span className={s.placeholder} style={{ backgroundColor: color }} />
                        )}
                      </div>
                    </SketchBox>

                    <div className={s.rowBody}>
                      <div className={s.rowHeader}>
                        <span className={`font-hand ${s.familyName}`} style={{ color }}>
                          {family.name}
                        </span>
                        <span className={`font-tabular ${s.familyMeta}`}>
                          Tier {family.tier}/{family.maxTier}
                        </span>
                      </div>
                      <div className={maxed ? s.maxedBar : undefined}>
                        <SketchProgress progress={progress} color={color} outlineColor={color} height={10} />
                      </div>
                      <p className={`font-tabular ${s.killCount}`}>
                        {family.kills.toLocaleString()}
                        {!maxed && family.nextTierKills && ` / ${family.nextTierKills.toLocaleString()} kills`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
