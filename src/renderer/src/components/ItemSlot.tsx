import { useState } from 'react'
import type { InventoryItem } from '@shared/types/item'
import SketchBox from './sketch/SketchBox'
import HeadIcon from './HeadIcon'
import ItemTooltip from './ItemTooltip'
import { getRarityColor } from '../lib/rarityColors'
import { getHplusIconUrl, getVanillaIconUrl } from '../lib/itemTextures'
import s from './ItemSlot.module.css'

export default function ItemSlot({ item }: { item: InventoryItem }): React.JSX.Element {
  const [hovered, setHovered] = useState(false)
  const color = getRarityColor(item.rarity)
  // Priority: an official custom skin texture (exact, from Hypixel) beats
  // Hypixel+'s guessed-id icon (usually right, occasionally wrong), which
  // beats the generic vanilla-material icon (always right, never unique).
  const hplusIconUrl = getHplusIconUrl(item.itemId)
  const vanillaIconUrl = getVanillaIconUrl(item.vanillaId)

  return (
    <div className={s.slot} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <SketchBox
        stroke={color}
        strokeWidth={1.5}
        roughness={1.4}
        className={`${s.box} ${item.recombobulated ? s.recombobulated : ''}`}
      >
        <div className={s.content}>
          {item.skinUrl ? (
            <HeadIcon skinUrl={item.skinUrl} size={26} />
          ) : hplusIconUrl ? (
            <img src={hplusIconUrl} alt="" className={s.vanillaIcon} />
          ) : vanillaIconUrl ? (
            <img src={vanillaIconUrl} alt="" className={s.vanillaIcon} />
          ) : (
            <span className={s.placeholder} style={{ backgroundColor: color }} />
          )}
          {item.count > 1 && <span className={s.count}>{item.count}</span>}
          {item.recombobulated && <span className={s.shine} />}
        </div>
      </SketchBox>
      {hovered && <ItemTooltip item={item} />}
    </div>
  )
}
