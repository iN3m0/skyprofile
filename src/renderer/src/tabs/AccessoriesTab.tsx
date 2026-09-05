import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import ItemSlot from '../components/ItemSlot'
import AccessoryRow from '../components/AccessoryRow'
import s from './AccessoriesTab.module.css'

export default function AccessoriesTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['accessories', profileId, uuid],
    queryFn: () => api.member.getAccessories(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={6} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load accessories.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has inventory api access disabled — can't show their accessories.
      </p>
    )
  }

  const { owned, missing, upgrades } = query.data

  return (
    <div className={s.sections}>
      <div>
        <h2 className={`font-hand ${s.sectionTitle}`}>Your Accessories</h2>
        {owned.length === 0 ? (
          <p className={`font-hand ${s.emptyState}`}>Accessory bag is empty.</p>
        ) : (
          <div className={s.grid}>
            {owned.map((item, i) => (
              <ItemSlot key={`${item.slot}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: 'var(--color-progress)' }}>
          Upgrades Available
        </h2>
        {upgrades.length === 0 ? (
          <p className={`font-hand ${s.emptyState}`}>No upgrades available — every owned accessory is maxed.</p>
        ) : (
          <div className={s.list}>
            {upgrades.map((u) => (
              <AccessoryRow
                key={u.itemId}
                itemId={u.itemId}
                name={u.name}
                rarity={u.rarity}
                price={u.price}
                fromName={u.fromName}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className={`font-hand ${s.sectionTitle}`} style={{ color: 'var(--color-rarity-special)' }}>
          Missing Accessories
        </h2>
        <div className={s.list}>
          {missing.map((m) => (
            <AccessoryRow key={m.itemId} itemId={m.itemId} name={m.name} rarity={m.rarity} price={m.price} />
          ))}
        </div>
      </div>
    </div>
  )
}
