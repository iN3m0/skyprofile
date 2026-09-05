import type { SkyblockXpEntry } from '@shared/types/xpCalculator'
import type { RawHypixelProfile } from '../hypixel/profileService'
import { getMinionDefinitions } from '../hypixel/resources'
import { getOwnedMinionTiersByType } from '../minions/minionService'
import { resolveCost, type ResolvedCost } from '../shared/craftCostService'
import minionTierXpRaw from './data/minionTierXp.json'

const MINION_TIER_XP = minionTierXpRaw as number[]

/**
 * Every not-yet-crafted (minion type, tier) the player could craft next —
 * "Craft Minions" grants fixed SkyBlock XP per tier reached, for *every*
 * type independently (confirmed: the wiki's per-type total — 46ish types
 * × up to 61 XP each — sums to the task's real total, so this isn't a
 * once-ever reward, it's per type). Each tier's crafting cost treats any
 * *lower* tier of that same type the player already owns as free (cost
 * 0) rather than re-pricing it, since its own recipe needs that lower
 * tier as an ingredient and the player already has it.
 */
export async function computeMinionXpEntries(
  profile: RawHypixelProfile,
  prices: Record<string, number>,
  cache: Map<string, number | null>
): Promise<SkyblockXpEntry[]> {
  const ownedTiers = getOwnedMinionTiersByType(profile)
  const definitions = await getMinionDefinitions()

  const entries: SkyblockXpEntry[] = []

  for (const def of definitions) {
    const ownedTier = ownedTiers.get(def.type) ?? 0
    if (ownedTier >= def.maxTier) continue

    // Every tier of this type up to and including the owned one is a real
    // item id the player already has — treat all of them as free
    // ingredients rather than re-pricing a chain the player has already
    // paid for once.
    const freeIds = new Set<string>()
    for (let t = 1; t <= ownedTier; t++) freeIds.add(`${def.type}_GENERATOR_${t}`)

    for (let tier = ownedTier + 1; tier <= def.maxTier; tier++) {
      const xp = MINION_TIER_XP[tier - 1]
      if (!xp) continue

      const itemId = `${def.type}_GENERATOR_${tier}`
      const result: ResolvedCost = resolveCost(itemId, prices, cache, freeIds)

      entries.push({
        source: 'minions',
        itemId,
        name: `${def.name} ${toRoman(tier)}`,
        category: 'Minions',
        xp,
        cost: result.cost,
        costPerXp: result.cost !== null ? result.cost / xp : null
      })

      // Tier N+1's recipe needs tier N — once tier N's own cost is
      // resolved above, later tiers of this same type should treat it as
      // free too (the player would have crafted it en route to N+1).
      freeIds.add(itemId)
    }
  }

  return entries
}

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
function toRoman(tier: number): string {
  return ROMAN_NUMERALS[tier - 1] ?? String(tier)
}
