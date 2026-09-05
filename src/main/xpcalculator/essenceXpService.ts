import type { SkyblockXpEntry } from '@shared/types/xpCalculator'
import essencePerksRaw from './data/essencePerks.json'

interface EssencePerk {
  name: string
  shop: string
  essenceType: string
  levels: number
  /** Sum of every level's Essence cost — see data/README.md for why this is a whole-perk total, not per-level. */
  totalEssenceCost: number
  xp: number
}
const ESSENCE_PERKS = essencePerksRaw as EssencePerk[]

/**
 * "Essence Shop Upgrades": every perk across the 6 Essence Shops, priced
 * as the coin-equivalent of fully maxing it from zero — Hypixel's API
 * doesn't expose which levels a player has already bought (only their
 * current Essence balance), so unlike every other source here this can't
 * be narrowed to "what's left to buy"; see data/README.md.
 */
export function computeEssenceXpEntries(prices: Record<string, number>): SkyblockXpEntry[] {
  const entries: SkyblockXpEntry[] = []

  for (const perk of ESSENCE_PERKS) {
    const essencePrice = prices[`ESSENCE_${perk.essenceType}`] ?? null
    const cost = essencePrice !== null ? essencePrice * perk.totalEssenceCost : null

    entries.push({
      source: 'essence',
      itemId: null,
      name: perk.name,
      category: `${perk.shop} Essence Shop`,
      xp: perk.xp,
      cost,
      costPerXp: cost !== null ? cost / perk.xp : null
    })
  }

  return entries
}
