import type { FusionTarget } from '@shared/types/attributeFusion'
import { getAttributeIconUrl } from '../lib/attributeIcons'
import { getHplusIconUrl } from '../lib/itemTextures'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import s from './FusionRecipeRow.module.css'

// Same fallback chain AttributesTab uses: a real per-shard head render if
// one exists, else the one generic Hypixel+ "Attribute Shard" icon —
// individual shards aren't itemized in Hypixel's own data.
const GENERIC_SHARD_ICON_URL = getHplusIconUrl('ATTRIBUTE_SHARD')

/** One row of the Attribute Calculator's fusion browser — a target shard and its cheapest known recipe. */
export default function FusionRecipeRow({ target }: { target: FusionTarget }): React.JSX.Element {
  const color = getRarityColor(target.rarity.toLowerCase())
  const iconUrl = getAttributeIconUrl(target.key) ?? GENERIC_SHARD_ICON_URL
  const recipe = target.cheapestFusion

  return (
    <div className={s.row}>
      {iconUrl ? (
        <img src={iconUrl} alt="" className={s.icon} />
      ) : (
        <span className={s.placeholder} style={{ backgroundColor: color }} />
      )}

      <div className={s.body}>
        <div className={s.header}>
          <span className="font-hand" style={{ color }}>
            {target.name}
          </span>
          {target.abilityName && <span className={s.abilityName}>({target.abilityName})</span>}
        </div>
        {recipe ? (
          <p className={`font-hand ${s.recipeText}`}>
            {recipe.inputA.fuseAmount}× {recipe.inputA.name} + {recipe.inputB.fuseAmount}×{' '}
            {recipe.inputB.name} → {recipe.outputCount}× {target.name}
          </p>
        ) : (
          <p className={`font-hand ${s.recipeText}`}>No fusion recipe known.</p>
        )}
      </div>

      <div className={s.cost}>
        <span className={`font-tabular ${recipe?.costPerOutput != null ? s.costValue : s.noPrice}`}>
          {recipe?.costPerOutput != null
            ? `${formatPrice(recipe.costPerOutput)}/shard`
            : 'no price data'}
        </span>
        {recipe?.totalCost != null && (
          <span className={`font-tabular ${s.totalCost}`}>
            ({formatPrice(recipe.totalCost)} total)
          </span>
        )}
      </div>
    </div>
  )
}
