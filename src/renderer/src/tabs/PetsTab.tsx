import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import HeadIcon from '../components/HeadIcon'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import s from './PetsTab.module.css'

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function PetsTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['pets', profileId, uuid],
    queryFn: () => api.member.getPets(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load pets.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has inventory api access disabled — can't show their pets.
      </p>
    )
  }

  const { pets, ownedTypeCount, totalTypeCount, totalXp, missing, petScore, petScoreMagicFind, totalCandyUsed } =
    query.data

  if (pets.length === 0) {
    return <p className={`font-hand ${s.emptyState}`}>No pets found on this profile.</p>
  }

  return (
    <div className={s.sections}>
      <div className={s.statsRow}>
        <SketchBox className={s.statBox} stroke="var(--color-accent)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Unique Pets</span>
            <span className={`font-tabular ${s.statValue}`}>
              {ownedTypeCount} / {totalTypeCount}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="var(--color-progress)" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Pet Score</span>
            <span className={`font-tabular ${s.statValue}`}>
              {petScore}
              {petScoreMagicFind > 0 && <span className={s.statSub}> (+{petScoreMagicFind} MF)</span>}
            </span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#e07fc0" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Candies Used</span>
            <span className={`font-tabular ${s.statValue}`}>{totalCandyUsed}</span>
          </div>
        </SketchBox>
        <SketchBox className={s.statBox} stroke="#8bc34a" strokeWidth={1.4} roughness={1.3}>
          <div className={s.statBoxContent}>
            <span className={`font-hand ${s.statLabel}`}>Total Pet XP</span>
            <span className={`font-tabular ${s.statValue}`}>{formatPrice(totalXp)}</span>
          </div>
        </SketchBox>
      </div>

      <div>
        <div className={s.grid}>
          {pets.map((pet) => {
            const color = getRarityColor(pet.rarity)
            const maxed = pet.level >= pet.maxLevel
            return (
              <div key={pet.uuid} className={s.row}>
                <SketchBox stroke={color} strokeWidth={1.5} roughness={1.4} className={s.box}>
                  <div className={s.boxContent}>
                    {pet.headTextureUrl ? (
                      <HeadIcon skinUrl={pet.headTextureUrl} size={26} />
                    ) : (
                      <span className={s.placeholder} style={{ backgroundColor: color }} />
                    )}
                  </div>
                </SketchBox>

                <div className={s.rowBody}>
                  <div className={s.rowHeader}>
                    <span className={`font-hand ${s.petName}`} style={{ color }}>
                      {pet.displayName}
                      {pet.active && <span className={s.activeBadge}> ★ active</span>}
                    </span>
                    <span className={`font-tabular ${s.petMeta}`}>
                      {maxed ? `Lv ${pet.level}` : `Lv ${pet.level} · ${Math.round(pet.progress * 100)}%`}
                    </span>
                  </div>
                  <div className={maxed ? s.maxedBar : undefined}>
                    <SketchProgress progress={maxed ? 1 : pet.progress} color={color} outlineColor={color} height={10} />
                  </div>
                  {pet.heldItem && (
                    <p className={`font-hand ${s.heldItem}`}>
                      holding: {titleCase(pet.heldItem.replace(/^PET_ITEM_/, ''))}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: 'var(--color-rarity-special)' }}>
          Missing Pets
        </h2>
        {missing.length === 0 ? (
          <p className={`font-hand ${s.emptyState}`}>Every catalogued pet type is owned.</p>
        ) : (
          <div className={s.missingList}>
            {missing.map((pet) => {
              const color = getRarityColor(pet.rarity)
              return (
                <div key={pet.type} className={s.missingRow}>
                  {pet.headTextureUrl ? (
                    <HeadIcon skinUrl={pet.headTextureUrl} size={20} />
                  ) : (
                    <span className={s.missingPlaceholder} style={{ backgroundColor: color }} />
                  )}
                  <span className="font-hand" style={{ color }}>
                    {pet.displayName}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
