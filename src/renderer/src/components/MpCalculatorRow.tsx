import { getHplusIconUrl } from '../lib/itemTextures'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import type { MpCalculatorEntry } from '@shared/types/accessories'
import s from './MpCalculatorRow.module.css'

/**
 * One row of the MP Calculator's ranked list. Deliberately not
 * `AccessoryRow` reused verbatim: that component's "fromName → name" arrow
 * fits the Accessories tab's per-item upgrade framing, but the real
 * SkyHelper `/missing` command (what this list clones) shows each row as
 * just "{name}[ Upgrade] — {cost} per MP ({price})", including synthetic
 * "Recombobulate N accessories" rows that don't have any single item icon.
 */
export default function MpCalculatorRow({
  entry
}: {
  entry: MpCalculatorEntry
}): React.JSX.Element {
  const color = getRarityColor(entry.rarity)
  const iconUrl = entry.itemId ? getHplusIconUrl(entry.itemId) : null

  return (
    <div className={s.row}>
      {iconUrl ? (
        <img src={iconUrl} alt="" className={s.icon} />
      ) : (
        <span className={s.placeholder} style={{ backgroundColor: color }} />
      )}
      <span className="font-hand" style={{ color, flex: 1, minWidth: 0 }}>
        {entry.name}
        {entry.isMultiRarityUpgrade && <span className={s.upgradeSuffix}> Upgrade</span>}
      </span>
      <span className={s.mpCost}>
        <span className={`font-tabular ${entry.costPerMp === null ? s.noPrice : s.costPerMp}`}>
          {entry.costPerMp === null ? 'no price data' : `${formatPrice(entry.costPerMp)} per MP`}
        </span>
        <span className={`font-tabular ${s.price}`}>({formatPrice(entry.price)})</span>
      </span>
    </div>
  )
}
