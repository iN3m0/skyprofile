import { getHplusIconUrl } from '../lib/itemTextures'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import s from './AccessoryRow.module.css'

export default function AccessoryRow({
  itemId,
  name,
  rarity,
  price,
  fromName
}: {
  itemId: string
  name: string
  rarity: string | null
  price: number | null
  /** When set, renders as "fromName → name" (an upgrade), not just "name". */
  fromName?: string
}): React.JSX.Element {
  const color = getRarityColor(rarity)
  const iconUrl = getHplusIconUrl(itemId)

  return (
    <div className={s.row}>
      {iconUrl ? (
        <img src={iconUrl} alt="" className={s.icon} />
      ) : (
        <span className={s.placeholder} style={{ backgroundColor: color }} />
      )}
      <span className="font-hand" style={{ color, flex: 1, minWidth: 0 }}>
        {fromName ? (
          <>
            <span className={s.fromName}>{fromName}</span> → {name}
          </>
        ) : (
          name
        )}
      </span>
      <span className={`font-tabular ${price === null ? s.noPrice : s.price}`}>{formatPrice(price)}</span>
    </div>
  )
}
