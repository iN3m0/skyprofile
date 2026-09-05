import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import HeadIcon from '../components/HeadIcon'
import { MARKER_COLORS } from '../lib/skillColors'
import type { Minion } from '@shared/types/minion'
import s from './MinionsTab.module.css'

function groupByCategory(minions: Minion[]): [string, Minion[]][] {
  const groups = new Map<string, Minion[]>()
  for (const minion of minions) {
    const list = groups.get(minion.category) ?? []
    list.push(minion)
    groups.set(minion.category, list)
  }
  return [...groups.entries()]
}

export default function MinionsTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['minions', profileId, uuid],
    queryFn: () => api.member.getMinions(profileId, uuid)
  })

  const categories = useMemo(() => groupByCategory(query.data?.minions ?? []), [query.data])

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load minions.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>this player has no minion data available for this profile.</p>
    )
  }

  const {
    missing,
    uniqueMinions,
    maxedMinions,
    totalTypes,
    craftedMinionSlots,
    uniqueMinionsToNextSlot,
    bonusMinionSlots,
    maxBonusMinionSlots
  } = query.data

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Unique Minions</span>
            <span className={`font-tabular ${s.statValue}`}>
              {uniqueMinions} / {totalTypes}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e8a33d" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Maxed Minions</span>
            <span className={`font-tabular ${s.statValue}`}>
              {maxedMinions} / {totalTypes}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="var(--color-progress)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Minion Slots</span>
            <span className={`font-tabular ${s.statValue}`}>{craftedMinionSlots}</span>
            {uniqueMinionsToNextSlot !== null && (
              <span className={s.statSub}>{uniqueMinionsToNextSlot} to next slot</span>
            )}
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e07fc0" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Bonus Minion Slots</span>
            <span className={`font-tabular ${s.statValue}`}>
              {bonusMinionSlots} / {maxBonusMinionSlots}
            </span>
          </div>
        </SketchBox>
      </div>

      {categories.length > 0 && (
        <nav className={s.jumpNav}>
          {categories.map(([category], i) => (
            <button
              key={`nav-${category}`}
              type="button"
              className={`font-hand ${s.jumpLink}`}
              style={{ color: MARKER_COLORS[i % MARKER_COLORS.length] }}
              onClick={() =>
                document.getElementById(`minion-cat-${category}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              {category}
            </button>
          ))}
        </nav>
      )}

      {categories.map(([category, categoryMinions], i) => {
        const color = MARKER_COLORS[i % MARKER_COLORS.length]
        return (
          <div key={category} id={`minion-cat-${category}`} className={s.categorySection}>
            <h2 className={`font-hand ${s.sectionTitle}`} style={{ color }}>
              {category}
            </h2>
            <div className={s.grid}>
              {categoryMinions.map((minion) => {
                const maxed = minion.tier >= minion.maxTier
                return (
                  <div key={minion.type} className={s.row}>
                    <SketchBox stroke={color} strokeWidth={1.5} roughness={1.4} className={s.box}>
                      <div className={s.boxContent}>
                        {minion.headTextureUrl ? (
                          <HeadIcon skinUrl={minion.headTextureUrl} size={26} />
                        ) : (
                          <span className={s.placeholder} style={{ backgroundColor: color }} />
                        )}
                      </div>
                    </SketchBox>

                    <div className={s.rowBody}>
                      <div className={s.rowHeader}>
                        <span className={`font-hand ${s.minionName}`} style={{ color }}>
                          {minion.name}
                        </span>
                        <span className={`font-tabular ${s.minionMeta}`}>
                          {minion.tier}/{minion.maxTier}
                        </span>
                      </div>
                      <div className={maxed ? s.maxedBar : undefined}>
                        <SketchProgress
                          progress={minion.tier / minion.maxTier}
                          color={color}
                          outlineColor={color}
                          height={10}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <div>
        <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: 'var(--color-rarity-special)' }}>
          Missing Minions
        </h2>
        {missing.length === 0 ? (
          <p className={`font-hand ${s.emptyState}`}>Every catalogued minion type has been started.</p>
        ) : (
          <div className={s.missingList}>
            {missing.map((minion) => (
              <div key={minion.type} className={s.missingRow}>
                {minion.headTextureUrl ? (
                  <HeadIcon skinUrl={minion.headTextureUrl} size={20} />
                ) : (
                  <span className={s.missingPlaceholder} />
                )}
                <span className="font-hand">{minion.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
