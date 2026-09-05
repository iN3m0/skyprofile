import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import { getRarityColor } from '../lib/rarityColors'
import { getHplusIconUrl } from '../lib/itemTextures'
import { getAttributeIconUrl } from '../lib/attributeIcons'
import type { Attribute, AttributeRarity } from '@shared/types/attribute'
import s from './AttributesTab.module.css'

// Attribute shards aren't individually itemized anywhere in Hypixel's own
// data (confirmed: only one generic "Attribute Shard" item exists
// site-wide) so there's no live-NBT-derived icon per attribute the way
// pets/minions/accessories get one — the per-attribute head renders in
// assets/attributes/ come from the wiki instead (see that folder's
// README). Falls back to the one generic shard icon for the rare case a
// specific render is missing, never to nothing.
const GENERIC_SHARD_ICON_URL = getHplusIconUrl('ATTRIBUTE_SHARD')

const RARITY_ORDER: AttributeRarity[] = ['LEGENDARY', 'EPIC', 'RARE', 'UNCOMMON', 'COMMON']

function groupByRarity(attributes: Attribute[]): [AttributeRarity, Attribute[]][] {
  const groups = new Map<AttributeRarity, Attribute[]>()
  for (const attr of attributes) {
    const list = groups.get(attr.rarity) ?? []
    list.push(attr)
    groups.set(attr.rarity, list)
  }
  return RARITY_ORDER.filter((r) => groups.has(r)).map((r) => [r, groups.get(r) as Attribute[]])
}

export default function AttributesTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['attributes', profileId, uuid],
    queryFn: () => api.member.getAttributes(profileId, uuid)
  })

  const groups = useMemo(() => groupByRarity(query.data?.attributes ?? []), [query.data])

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load attributes.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>this player has no attribute data available for this profile.</p>
    )
  }

  const { unclassified, ownedCount, maxedCount, totalCatalogued } = query.data

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Attributes Owned</span>
            <span className={`font-tabular ${s.statValue}`}>
              {ownedCount} / {totalCatalogued}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e8a33d" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Maxed (Lv 10)</span>
            <span className={`font-tabular ${s.statValue}`}>
              {maxedCount} / {totalCatalogued}
            </span>
          </div>
        </SketchBox>
      </div>

      {groups.length > 0 && (
        <nav className={s.jumpNav}>
          {groups.map(([rarity]) => (
            <button
              key={`nav-${rarity}`}
              type="button"
              className={`font-hand ${s.jumpLink}`}
              style={{ color: getRarityColor(rarity.toLowerCase()) }}
              onClick={() =>
                document.getElementById(`attr-rarity-${rarity}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              {rarity}
            </button>
          ))}
          {unclassified.length > 0 && (
            <button
              type="button"
              className={`font-hand ${s.jumpLink}`}
              style={{ color: 'var(--color-text-faint)' }}
              onClick={() =>
                document.getElementById('attr-rarity-unclassified')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              Unclassified
            </button>
          )}
        </nav>
      )}

      {groups.map(([rarity, attrs]) => {
        const color = getRarityColor(rarity.toLowerCase())
        return (
          <div key={rarity} id={`attr-rarity-${rarity}`} className={s.categorySection}>
            <h2 className={`font-hand ${s.sectionTitle}`} style={{ color }}>
              {rarity}
            </h2>
            <div className={s.grid}>
              {attrs.map((attr) => {
                const maxed = attr.level >= attr.maxLevel
                const rowColor = attr.owned ? color : 'var(--color-text-faint)'
                const iconUrl = getAttributeIconUrl(attr.key) ?? GENERIC_SHARD_ICON_URL
                return (
                  <div key={attr.key} className={`${s.row} ${attr.owned ? '' : s.unownedRow}`}>
                    <SketchBox stroke={rowColor} strokeWidth={1.5} roughness={1.4} className={s.box}>
                      <div className={s.boxContent}>
                        {iconUrl ? (
                          <img src={iconUrl} alt="" className={s.shardIcon} />
                        ) : (
                          <span className={s.placeholder} style={{ backgroundColor: rowColor }} />
                        )}
                      </div>
                    </SketchBox>

                    <div className={s.rowBody}>
                      <div className={s.rowHeader}>
                        <span className={`font-hand ${s.attrName}`} style={{ color: rowColor }}>
                          {attr.displayName}
                        </span>
                        <span className={`font-tabular ${s.attrMeta}`}>
                          {attr.owned ? `Lv ${attr.level}/${attr.maxLevel}` : 'not owned'}
                        </span>
                      </div>
                      {attr.effect && <p className={`font-hand ${s.effectText}`}>{attr.effect}</p>}
                      {attr.owned && (
                        <>
                          <div className={maxed ? s.maxedBar : undefined}>
                            <SketchProgress
                              progress={attr.level / attr.maxLevel}
                              color={rowColor}
                              outlineColor={rowColor}
                              height={10}
                            />
                          </div>
                          <p className={`font-tabular ${s.stackCount}`}>
                            {attr.stacks.toLocaleString()} shards
                            {!maxed && attr.stacksForNextLevel !== null && ` · ${attr.stacksForNextLevel} to next level`}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {unclassified.length > 0 && (
        <div id="attr-rarity-unclassified" className={s.categorySection}>
          <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: 'var(--color-text-faint)' }}>
            Unclassified
          </h2>
          <p className={`font-hand ${s.unclassifiedNote}`}>
            Owned, but this app couldn't confidently match these to a known attribute's rarity/level curve — shown
            with their raw shard count only.
          </p>
          <div className={s.unclassifiedList}>
            {unclassified.map((attr) => (
              <div key={attr.key} className={s.unclassifiedRow}>
                <span className="font-hand">{attr.key}</span>
                <span className="font-tabular">{attr.stacks.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
