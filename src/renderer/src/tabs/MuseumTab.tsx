import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import HeadIcon from '../components/HeadIcon'
import ItemTooltip from '../components/ItemTooltip'
import { getRarityColor } from '../lib/rarityColors'
import { getHplusIconUrl } from '../lib/itemTextures'
import { formatPrice } from '../lib/formatPrice'
import { MARKER_COLORS } from '../lib/skillColors'
import type { MuseumItem } from '@shared/types/museum'
import s from './MuseumTab.module.css'

function MuseumItemRow({ item, color }: { item: MuseumItem; color: string }): React.JSX.Element {
  const [hovered, setHovered] = useState(false)
  // Museum donations only get a real head icon when the donated item
  // happens to be a custom-skin skull (a bow or sword isn't) — Hypixel+'s
  // guessed-id icon set fills in the rest, same fallback priority
  // ItemSlot uses elsewhere.
  const hplusIconUrl = !item.headTextureUrl ? getHplusIconUrl(item.itemId) : null

  return (
    <div
      className={`${s.row} ${item.donated ? '' : s.undonatedRow}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <SketchBox stroke={color} strokeWidth={1.5} roughness={1.4} className={s.box}>
        <div className={s.boxContent}>
          {item.headTextureUrl ? (
            <HeadIcon skinUrl={item.headTextureUrl} size={26} />
          ) : hplusIconUrl ? (
            <img src={hplusIconUrl} alt="" className={s.vanillaIcon} />
          ) : (
            <span className={s.placeholder} style={{ backgroundColor: color }} />
          )}
        </div>
      </SketchBox>
      <span className={`font-hand ${s.itemName}`} style={{ color }}>
        {item.name}
      </span>
      {/* Only a donated item has real NBT to show — an undonated one has
          no instance to read a lore/name tag off of, so no tooltip. */}
      {hovered && item.donated && item.displayName && item.lore && (
        <ItemTooltip
          item={{
            slot: 0,
            itemId: item.itemId,
            vanillaId: null,
            displayName: item.displayName,
            lore: item.lore,
            rarity: item.rarity,
            count: 1,
            enchantments: [],
            skinUrl: item.headTextureUrl,
            recombobulated: false
          }}
        />
      )}
    </div>
  )
}

export default function MuseumTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['museum', profileId, uuid],
    queryFn: () => api.member.getMuseum(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load museum.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return <p className={`font-hand ${s.emptyState}`}>this player has no museum data available for this profile.</p>
  }

  const { value, categories, donatedCount, totalCatalogued } = query.data

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Donated</span>
            <span className={`font-tabular ${s.statValue}`}>
              {donatedCount} / {totalCatalogued}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e8a33d" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Museum Value</span>
            <span className={`font-tabular ${s.statValue}`}>{formatPrice(value)}</span>
          </div>
        </SketchBox>
      </div>

      <nav className={s.jumpNav}>
        {categories.map((category, i) => (
          <button
            key={`nav-${category.key}`}
            type="button"
            className={`font-hand ${s.jumpLink}`}
            style={{ color: MARKER_COLORS[i % MARKER_COLORS.length] }}
            onClick={() =>
              document.getElementById(`museum-cat-${category.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            {category.name} ({category.donatedCount}/{category.totalCount})
          </button>
        ))}
      </nav>

      {categories.map((category, i) => {
        const headingColor = MARKER_COLORS[i % MARKER_COLORS.length]
        return (
          <div key={category.key} id={`museum-cat-${category.key}`} className={s.categorySection}>
            <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: headingColor }}>
              {category.name}
            </h2>
            <div className={s.grid}>
              {category.items.map((item) => (
                <MuseumItemRow
                  key={item.itemId}
                  item={item}
                  color={item.donated ? getRarityColor(item.rarity) : 'var(--color-text-faint)'}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
