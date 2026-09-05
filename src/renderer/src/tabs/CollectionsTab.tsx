import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import { getSkillColor } from '../lib/skillColors'
import { getItemIconUrl } from '../lib/itemTextures'
import HeadIcon from '../components/HeadIcon'
import s from './CollectionsTab.module.css'

export default function CollectionsTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['collections', profileId, uuid],
    queryFn: () => api.member.getCollections(profileId, uuid)
  })
  // Custom Skyblock items with no vanilla texture are player heads with a
  // custom skin — this resource-derived map is the fallback source for
  // those, on top of the static vanilla-icon map. Long staleTime: it's
  // effectively static reference data, not per-player.
  const skinsQuery = useQuery({
    queryKey: ['resources', 'itemSkins'],
    queryFn: () => api.resources.getItemSkins(),
    staleTime: 24 * 60 * 60 * 1000
  })

  if (query.isLoading) return <SkeletonRows count={10} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load collections.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has collections api access disabled — can't show tiers for them.
      </p>
    )
  }

  return (
    <div className={s.categories}>
      {query.data.categories.map((category) => {
        const started = category.entries.filter((entry) => entry.amount > 0)
        if (started.length === 0) return null
        const color = getSkillColor(category.key)
        return (
          <div key={category.key}>
            <h2 className={`font-hand ${s.categoryTitle}`} style={{ color }}>
              <span className={s.categoryDot} style={{ backgroundColor: color }} />
              {category.name}
            </h2>
            <div className={s.entryGrid}>
              {started.map((entry) => {
                const maxed = entry.tier >= entry.maxTier
                // The category color is this entry's identity — name and
                // tick stay that color always. Only the tier number goes
                // gold to signal "maxed".
                const tierColor = maxed ? 'var(--color-accent)' : color
                const iconUrl = getItemIconUrl(entry.id)
                const skinUrl = skinsQuery.data?.[entry.id]
                return (
                  <div key={entry.id} className={s.entryRow} style={{ borderBottomColor: `${color}55` }}>
                    <span className={s.entryLabel}>
                      {iconUrl ? (
                        <img src={iconUrl} alt="" className={s.entryIcon} />
                      ) : skinUrl ? (
                        <HeadIcon skinUrl={skinUrl} size={18} />
                      ) : (
                        <span className={s.entryTick} style={{ backgroundColor: color }} />
                      )}
                      <span className={`font-hand ${s.entryName}`} style={{ color }}>
                        {entry.name}
                      </span>
                    </span>
                    <span className="font-tabular">
                      <span style={{ color: tierColor }}>
                        {entry.tier}/{entry.maxTier}
                      </span>
                      <span className={s.entryAmount}>{entry.amount.toLocaleString()}</span>
                    </span>
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
