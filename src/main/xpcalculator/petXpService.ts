import type { SkyblockXpEntry } from '@shared/types/xpCalculator'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { computePets } from '../pets/petService'
import { PET_DATA, PET_VALUE } from '../pets/constants'

const PET_RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Every pet type where buying a higher rarity would raise Pet Score —
 * "Pet Score" grants +3 SkyBlock XP per point (see the wiki's Ways to
 * Gain XP page), and Pet Score itself only counts each *type*'s single
 * best-rarity copy (see `petService.ts`'s own `getPetScore`, ported from
 * the same source) — so buying a duplicate at a rarity you already own
 * gains nothing; only a strictly higher rarity than your current best for
 * that type counts. Priced off `LVL_1_<RARITY>_<TYPE>`, a real per-(level,
 * rarity, type) AH price already in skyhelper-networth's price list
 * (confirmed live) — level 1 since a freshly-bought pet is what you'd
 * actually buy, not a pre-leveled one.
 */
export function computePetXpEntries(
  profile: RawHypixelProfile,
  member: RawHypixelMember,
  prices: Record<string, number>
): SkyblockXpEntry[] {
  const petsSummary = computePets(profile, member)
  if (!petsSummary.apiEnabled) return []

  const bestValueByType = new Map<string, number>()
  for (const pet of petsSummary.pets) {
    const value = PET_VALUE[pet.rarity] ?? 0
    if (value > (bestValueByType.get(pet.type) ?? 0)) {
      bestValueByType.set(pet.type, value)
    }
  }

  const entries: SkyblockXpEntry[] = []

  for (const [type, def] of Object.entries(PET_DATA)) {
    if (def.ignoredInPetScoreCalculation) continue

    const maxRarityIndex = PET_RARITY_ORDER.indexOf(def.maxTier)
    if (maxRarityIndex === -1) continue

    const currentValue = bestValueByType.get(type) ?? 0
    let best: { cost: number; gain: number } | null = null

    for (let i = 0; i <= maxRarityIndex; i++) {
      const rarity = PET_RARITY_ORDER[i]
      const value = PET_VALUE[rarity] ?? 0
      if (value <= currentValue) continue // not an upgrade over what's already owned

      const price = prices[`LVL_1_${rarity.toUpperCase()}_${type}`] ?? null
      if (price === null) continue

      const gain = value - currentValue
      if (best === null || price / gain < best.cost / best.gain) {
        best = { cost: price, gain }
      }
    }

    if (!best) continue

    const xp = best.gain * 3
    entries.push({
      source: 'pets',
      itemId: null,
      name: `${titleCase(type)} Pet`,
      category: 'Pets',
      xp,
      cost: best.cost,
      costPerXp: best.cost / xp
    })
  }

  return entries
}
