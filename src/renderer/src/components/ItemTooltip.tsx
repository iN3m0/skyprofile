import type { InventoryItem } from '@shared/types/item'
import MinecraftText from './MinecraftText'
import SketchBox from './sketch/SketchBox'
import { getRarityColor } from '../lib/rarityColors'
import s from './ItemTooltip.module.css'

export default function ItemTooltip({ item }: { item: InventoryItem }): React.JSX.Element {
  return (
    <div className={s.wrap}>
      <SketchBox stroke={getRarityColor(item.rarity)} strokeWidth={2} roughness={1.3}>
        <div className={s.inner}>
          <MinecraftText text={item.displayName} className={s.name} />
          {item.count > 1 && <span className={s.count}> x{item.count}</span>}
          {item.lore.length > 0 && (
            <div className={s.lore}>
              {item.lore.map((line, i) => (
                <div key={i}>
                  <MinecraftText text={line || ' '} />
                </div>
              ))}
            </div>
          )}
        </div>
      </SketchBox>
    </div>
  )
}
