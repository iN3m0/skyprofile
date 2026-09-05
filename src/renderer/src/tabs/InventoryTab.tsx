import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { SkeletonRows } from '../components/Skeleton'
import ItemSlot from '../components/ItemSlot'
import s from './InventoryTab.module.css'

export default function InventoryTab({
  profileId,
  uuid
}: {
  profileId: string
  uuid: string
}): React.JSX.Element {
  const query = useQuery({
    queryKey: ['inventory', profileId, uuid],
    queryFn: () => api.member.getInventory(profileId, uuid)
  })

  if (query.isLoading) return <SkeletonRows count={6} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load inventory.'}
      </p>
    )
  }
  if (!query.data) return <></>

  if (!query.data.apiEnabled) {
    return (
      <p className={`font-hand ${s.emptyState}`}>
        this player has inventory api access disabled — can't show their items.
      </p>
    )
  }

  return (
    <div className={s.sections}>
      {/* Accessory Bag has its own tab now (see AccessoriesTab), alongside
          missing accessories/upgrades. */}
      {query.data.containers
        .filter((container) => container.key !== 'accessoryBag')
        .map((container) => (
        <div key={container.key}>
          <h2 className={`font-hand ${s.sectionTitle}`}>{container.name}</h2>
          <div className={s.grid}>
            {container.items.map((item, i) => (
              <ItemSlot key={`${item.slot}-${i}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
