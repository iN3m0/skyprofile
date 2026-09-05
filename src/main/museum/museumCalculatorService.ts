import type { MuseumCalculatorEntry, MuseumCalculatorSummary } from '@shared/types/museumCalculator'
import type { Rarity } from '@shared/types/item'
// skyhelper-networth is already a project dependency (accessories/
// attributes both reuse its price list) — same source here, and it's
// exactly "buy from AH" (plus bazaar) since that's what it's priced from.
import { getPrices } from 'skyhelper-networth'
import { getItemDefinitionsById } from '../hypixel/resources'
import { normalizeUuid } from '../hypixel/profileService'
import { invalidate } from '../cache/cacheStore'
import { getRawMuseum } from './museumService'
import {
  getMuseumSetDisplayName,
  MUSEUM_CATEGORY_ITEMS,
  MUSEUM_CATEGORY_NAMES,
  resolveMuseumDisplayId
} from './constants'
import museumXpRaw from './data/museumXp.json'
import { createCraftCostCache, resolveCost } from '../shared/craftCostService'

const MUSEUM_XP = museumXpRaw as Record<string, number>

/**
 * "Cheapest items to donate per SkyBlock XP": every not-yet-donated Museum
 * item, priced at whichever's cheaper right now — buying it off the AH/
 * bazaar, or crafting it — ranked by coins per point of XP the donation
 * grants. `force: true` bypasses both the price cache and this app's 60s
 * museum-data cache (for a manual refresh after buying/crafting/donating).
 */
export async function computeMuseumCalculator(
  profileId: string,
  uuid: string,
  force = false
): Promise<MuseumCalculatorSummary> {
  if (force) invalidate(`museum:${profileId}`)

  const raw = await getRawMuseum(profileId)
  const target = normalizeUuid(uuid)
  const memberEntry = Object.entries(raw.members ?? {}).find(
    ([key]) => normalizeUuid(key) === target
  )
  const member = memberEntry?.[1]

  if (!member) return { apiEnabled: false, entries: [] }

  const donatedIds = new Set(Object.keys(member.items ?? {}))
  const [itemDefs, prices] = await Promise.all([
    getItemDefinitionsById(),
    getPrices(!force).catch(() => ({}) as Record<string, number>)
  ])

  const cache = createCraftCostCache()
  const entries: MuseumCalculatorEntry[] = []

  // "special" is excluded — it's the same event/novelty/legacy grab-bag
  // the Museum tab itself excludes from its own donation total (see
  // museumService.ts), and it isn't in itemToXp at all (confirmed 636/636
  // coverage is exactly the 7 non-special categories, nothing more).
  for (const [category, ids] of Object.entries(MUSEUM_CATEGORY_ITEMS)) {
    if (category === 'special') continue

    for (const itemId of ids) {
      // Donation-matching and the XP table both key off the catalog's own
      // base id (confirmed live: real donation data uses these same bare
      // ids for armor sets, e.g. "STARLIGHT" not "STARLIGHT_HELMET") — but
      // an armor-set entry like "MELON" isn't a real, priceable Hypixel
      // item on its own (it coincidentally collides with the real,
      // unrelated Melon crop item), so pricing/crafting/naming needs the
      // *resolved* id instead. See constants.ts for the full story.
      if (donatedIds.has(itemId)) continue

      const xp = MUSEUM_XP[itemId]
      if (!xp) continue

      const displayId = resolveMuseumDisplayId(itemId)
      const { cost, source } = resolveCost(displayId, prices, cache)
      const def = itemDefs[displayId]

      entries.push({
        itemId: displayId,
        // A set piece's own real name ("Tater Helmet") reads as one
        // specific piece, not the set it actually represents — prefer the
        // set-derived name ("Melon Armor") when this is a set at all.
        name: getMuseumSetDisplayName(itemId) ?? def?.name ?? itemId,
        rarity: (def?.rarity as Rarity | null) ?? null,
        category: MUSEUM_CATEGORY_NAMES[category] ?? category,
        xp,
        cost,
        costSource: source,
        costPerXp: cost !== null ? cost / xp : null
      })
    }
  }

  entries.sort((a, b) => {
    if (a.costPerXp === null && b.costPerXp === null) return 0
    if (a.costPerXp === null) return 1
    if (b.costPerXp === null) return -1
    return a.costPerXp - b.costPerXp
  })

  return { apiEnabled: true, entries }
}
