import type {
  AccessoriesSummary,
  AccessoryListing,
  AccessoryUpgrade,
  MpCalculatorEntry
} from '@shared/types/accessories'
import type { InventoryItem, MemberInventory, Rarity } from '@shared/types/item'
import { getAccessoryDefinitions, type AccessoryDefinition } from '../hypixel/resources'
import {
  ACCESSORY_ALIASES,
  ACCESSORY_UPGRADES,
  getMagicalPower,
  IGNORED_ACCESSORIES,
  PULSE_RING_UPGRADE_COST,
  RARITY_LADDER,
  RECOMB_INELIGIBLE_IDS,
  resolveAlias,
  SPECIAL_ACCESSORY_RARITIES,
  MAGICAL_POWER
} from './constants'
// skyhelper-networth is already a project dependency (for the eventual
// networth milestone) — its price list is exactly what's needed here too,
// so reuse it rather than fetching a second, different price source.
import { getPrices } from 'skyhelper-networth'

const ALIAS_TARGET_IDS = new Set(Object.values(ACCESSORY_ALIASES).flat())

function sortByPriceAscendingNullsLast<T extends { price: number | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a.price === null && b.price === null) return 0
    if (a.price === null) return 1
    if (b.price === null) return -1
    return a.price - b.price
  })
}

function sortByCostPerMpAscendingNullsLast<T extends { costPerMp: number | null }>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    if (a.costPerMp === null && b.costPerMp === null) return 0
    if (a.costPerMp === null) return 1
    if (b.costPerMp === null) return -1
    return a.costPerMp - b.costPerMp
  })
}

/** floor(price / magical power granted) — the "coins per MP" the MP Calculator ranks by. */
function computeCostPerMp(
  price: number | null,
  rarity: Rarity | null,
  itemId: string
): number | null {
  if (price === null || rarity === null) return null
  const mp = getMagicalPower(rarity, itemId)
  return mp > 0 ? Math.floor(price / mp) : null
}

/**
 * Given one upgrade chain (lowest tier first) and the set of owned ids,
 * decides whether it's fully missing (report the base tier) or partially
 * owned with a further upgrade available (report the very next tier).
 * Shared between the hand-curated chains and the auto-detected ones below
 * so both follow identical logic. Also records every *other* owned id in
 * the chain as "redundant" (a duplicate lower tier kept after upgrading) —
 * used by the Recombobulator band calc below, since recombobulating a
 * redundant duplicate doesn't gain any Magical Power.
 */
function evaluateChain(
  chain: string[],
  ownedIds: Set<string>,
  byId: Map<string, AccessoryDefinition>,
  priceOf: (id: string) => number | null,
  missing: AccessoryListing[],
  upgrades: AccessoryUpgrade[],
  redundant: Set<string>
): void {
  let ownedIndex = -1
  for (let i = chain.length - 1; i >= 0; i--) {
    if (ownedIds.has(chain[i])) {
      ownedIndex = i
      break
    }
  }

  for (let i = 0; i < chain.length; i++) {
    if (i !== ownedIndex && ownedIds.has(chain[i])) redundant.add(chain[i])
  }

  if (ownedIndex === -1) {
    const base = byId.get(chain[0])
    if (base && !IGNORED_ACCESSORIES.has(base.id)) {
      const rarity = base.rarity as Rarity | null
      const price = priceOf(base.id)
      missing.push({
        itemId: base.id,
        name: base.name,
        rarity,
        price,
        costPerMp: computeCostPerMp(price, rarity, base.id)
      })
    }
  } else if (ownedIndex < chain.length - 1) {
    const from = byId.get(chain[ownedIndex])
    const to = byId.get(chain[ownedIndex + 1])
    if (from && to && !IGNORED_ACCESSORIES.has(to.id)) {
      const rarity = to.rarity as Rarity | null
      const price = priceOf(to.id)
      upgrades.push({
        itemId: to.id,
        name: to.name,
        rarity,
        price,
        costPerMp: computeCostPerMp(price, rarity, to.id),
        fromItemId: from.id,
        fromName: from.name
      })
    }
  }
}

// The overwhelmingly common tier-word progression across accessory
// families (WOLF_TALISMAN → WOLF_RING → WOLF_ARTIFACT → WOLF_RELIC, and
// dozens more) — verified against every curated chain already in
// constants.ts, all of which follow this exact order, plus cross-checked
// against the community wiki's own family listing. A few chains (e.g.
// Freshly Baked) go one rung further, to a "Heirloom".
const TIER_WORD_RANK: Record<string, number> = {
  TALISMAN: 0,
  BADGE: 0,
  RING: 1,
  ARTIFACT: 2,
  RELIC: 3,
  HEIRLOOM: 4
}
const TIER_WORD_PATTERN = new RegExp(`^(.*)_(${Object.keys(TIER_WORD_RANK).join('|')})$`)
const NUMERIC_SUFFIX_PATTERN = /^(.*)_(\d+)$/

/**
 * Hand-curated chains (ACCESSORY_UPGRADES) inevitably go stale as Hypixel
 * adds new tiered accessory families — that's exactly how both
 * SOUL_CAMPFIRE_TALISMAN (a numbered-tier family) and ordinary families
 * like HONEYCOMB_TALISMAN/_RING/_ARTIFACT (a word-tier family) ended up
 * reported as "missing" despite the player owning the upgraded version,
 * before being handled here. As a safety net for whatever's *still* not
 * curated, auto-detect any other `<BASE>_<N>` or `<BASE>_TALISMAN` /
 * `_RING` / `_ARTIFACT` / `_RELIC` family (2+ members sharing a base) and
 * treat it as an implicit chain the same way. Less precise than a curated
 * chain for the numeric case (no "these numbers are just cosmetic
 * reskins of that milestone" grouping), but correct in the way that
 * actually matters: owning a higher tier always means the lower ones are
 * never reported as missing.
 */
function autoDetectChains(
  definitions: AccessoryDefinition[],
  alreadyHandled: Set<string>
): string[][] {
  const numericGroups = new Map<string, { id: string; rank: number }[]>()
  const wordGroups = new Map<string, { id: string; rank: number }[]>()

  for (const def of definitions) {
    if (
      alreadyHandled.has(def.id) ||
      ALIAS_TARGET_IDS.has(def.id) ||
      IGNORED_ACCESSORIES.has(def.id)
    )
      continue

    const wordMatch = TIER_WORD_PATTERN.exec(def.id)
    if (wordMatch) {
      const [, base, word] = wordMatch
      const group = wordGroups.get(base) ?? []
      group.push({ id: def.id, rank: TIER_WORD_RANK[word] })
      wordGroups.set(base, group)
      continue
    }

    const numericMatch = NUMERIC_SUFFIX_PATTERN.exec(def.id)
    if (numericMatch) {
      const [, base, n] = numericMatch
      const group = numericGroups.get(base) ?? []
      group.push({ id: def.id, rank: Number(n) })
      numericGroups.set(base, group)
    }
  }

  const chains: string[][] = []
  for (const group of [...numericGroups.values(), ...wordGroups.values()]) {
    if (group.length < 2) continue
    chains.push(group.sort((a, b) => a.rank - b.rank).map((g) => g.id))
  }
  return chains
}

/**
 * The ~5 multi-rarity "custom price" items (Pulse Ring, Power Artifact,
 * ...) — one row per rarity tier not yet reached, using each owned bag
 * instance's *actual* current rarity (not the catalog's default one,
 * since these are exactly the items whose whole point is being ownable at
 * several different rarities at once).
 */
function buildSpecialUpgradeEntries(
  byId: Map<string, AccessoryDefinition>,
  ownedBagItems: InventoryItem[],
  priceOf: (id: string) => number | null
): MpCalculatorEntry[] {
  const entries: MpCalculatorEntry[] = []

  for (const [id, rarities] of Object.entries(SPECIAL_ACCESSORY_RARITIES)) {
    const def = byId.get(id)
    if (!def) continue

    let highestOwnedRank = -1
    for (const item of ownedBagItems) {
      if (item.itemId === id && item.rarity) {
        highestOwnedRank = Math.max(highestOwnedRank, RARITY_LADDER.indexOf(item.rarity))
      }
    }

    for (const rarity of rarities) {
      if (RARITY_LADDER.indexOf(rarity) <= highestOwnedRank) continue

      let price: number | null
      if (id === 'PULSE_RING') {
        const bottlePrice = priceOf('THUNDER_IN_A_BOTTLE')
        const copies = PULSE_RING_UPGRADE_COST[rarity]
        price = bottlePrice !== null && copies !== undefined ? bottlePrice * copies : null
      } else {
        price = priceOf(id)
      }

      entries.push({
        itemId: id,
        name: def.name,
        rarity,
        price,
        costPerMp: computeCostPerMp(price, rarity, id),
        isMultiRarityUpgrade: true
      })
    }
  }

  return entries
}

/**
 * Synthetic "Recombobulate N accessories" bands — grouping every owned,
 * not-yet-recombobulated, recomb-eligible accessory by its *current*
 * rarity, since Recombobulator 3000 has one fixed price but the Magical
 * Power it grants (next tier's MP minus current tier's) differs by rarity
 * band. Redundant duplicates (a lower tier kept after upgrading — see
 * `evaluateChain`) are excluded since recombobulating one grants no MP.
 */
function buildRecombobulateBands(
  ownedBagItems: InventoryItem[],
  redundantIds: Set<string>,
  recombobulatorPrice: number | null
): MpCalculatorEntry[] {
  const counts = new Map<Rarity, number>()

  for (const item of ownedBagItems) {
    if (!item.itemId || !item.rarity || item.recombobulated) continue
    if (RECOMB_INELIGIBLE_IDS.has(item.itemId)) continue
    if (redundantIds.has(resolveAlias(item.itemId))) continue

    const rank = RARITY_LADDER.indexOf(item.rarity)
    if (rank === -1 || rank >= RARITY_LADDER.length - 1) continue // unranked, or already mythic

    counts.set(item.rarity, (counts.get(item.rarity) ?? 0) + 1)
  }

  const entries: MpCalculatorEntry[] = []
  for (const [rarity, count] of counts) {
    const nextRarity = RARITY_LADDER[RARITY_LADDER.indexOf(rarity) + 1]
    const delta = (MAGICAL_POWER[nextRarity] ?? 0) - (MAGICAL_POWER[rarity] ?? 0)
    const costPerMp =
      recombobulatorPrice !== null && delta > 0 ? Math.floor(recombobulatorPrice / delta) : null

    entries.push({
      itemId: null,
      name: `Recombobulate ${count} accessor${count === 1 ? 'y' : 'ies'}`,
      rarity: nextRarity,
      price: recombobulatorPrice,
      costPerMp,
      recombobulateCount: count
    })
  }

  return entries
}

export async function computeAccessories(inventory: MemberInventory): Promise<AccessoriesSummary> {
  if (!inventory.apiEnabled) {
    return { apiEnabled: false, owned: [], missing: [], upgrades: [], mpCalculator: [] }
  }

  // Owning a cosmetic alias (e.g. CAMPFIRE_TALISMAN_2) counts as owning its
  // canonical chain member (CAMPFIRE_TALISMAN_1) — resolveAlias folds that
  // in here so the rest of this function only ever deals in canonical ids.
  const ownedIds = new Set<string>()
  for (const container of inventory.containers) {
    for (const item of container.items) {
      if (item.itemId) ownedIds.add(resolveAlias(item.itemId))
    }
  }

  const [definitions, prices] = await Promise.all([
    getAccessoryDefinitions(),
    getPrices().catch(() => ({}))
  ])
  const byId = new Map(definitions.map((d) => [d.id, d]))
  const priceOf = (id: string): number | null => prices[id] ?? null

  // "Your Accessories" shows what's physically sitting in the bag right
  // now — not every accessory owned anywhere (equipped, loose in main
  // inventory, ender chest, vault also count toward "owned" for the
  // missing/upgrade detection below via `ownedIds`, since Hypixel grants
  // an accessory's passive account-wide the moment you've ever picked it
  // up — but displaying one of those as "in the bag" here is misleading
  // when it isn't).
  const owned = inventory.containers
    .filter((c) => c.key === 'accessoryBag')
    .flatMap((c) => c.items)
    .filter((item) => item.itemId !== null && byId.has(item.itemId))

  const missing: AccessoryListing[] = []
  const upgrades: AccessoryUpgrade[] = []
  const inChain = new Set<string>()
  const redundantIds = new Set<string>()

  for (const chain of ACCESSORY_UPGRADES) {
    for (const id of chain) inChain.add(id)
    evaluateChain(chain, ownedIds, byId, priceOf, missing, upgrades, redundantIds)
  }

  for (const chain of autoDetectChains(definitions, inChain)) {
    for (const id of chain) inChain.add(id)
    evaluateChain(chain, ownedIds, byId, priceOf, missing, upgrades, redundantIds)
  }

  // Standalone accessories: not part of any (curated or auto-detected)
  // upgrade chain, not a cosmetic alias of one, not on the ignore list, and
  // not one of the multi-rarity "custom price" ids (those get their own
  // per-rarity treatment below, in the MP Calculator list only) — just
  // plain owned-or-missing.
  for (const def of definitions) {
    if (inChain.has(def.id) || ALIAS_TARGET_IDS.has(def.id) || IGNORED_ACCESSORIES.has(def.id))
      continue
    if (def.id in SPECIAL_ACCESSORY_RARITIES) continue
    if (!ownedIds.has(def.id)) {
      const rarity = def.rarity as Rarity | null
      const price = priceOf(def.id)
      missing.push({
        itemId: def.id,
        name: def.name,
        rarity,
        price,
        costPerMp: computeCostPerMp(price, rarity, def.id)
      })
    }
  }

  // The MP Calculator — a clone of SkyHelper's `/missing` command: every
  // missing/upgradeable accessory, the multi-rarity items, and the
  // Recombobulator bands, merged into one list and ranked by coins spent
  // per point of Magical Power gained (not raw price).
  const specialUpgrades = buildSpecialUpgradeEntries(byId, owned, priceOf)
  const recombobulateBands = buildRecombobulateBands(
    owned,
    redundantIds,
    priceOf('RECOMBOBULATOR_3000')
  )
  const mpCalculator = sortByCostPerMpAscendingNullsLast<MpCalculatorEntry>([
    ...missing.map((m) => ({ ...m })),
    ...upgrades.map((u) => ({
      itemId: u.itemId,
      name: u.name,
      rarity: u.rarity,
      price: u.price,
      costPerMp: u.costPerMp
    })),
    ...specialUpgrades,
    ...recombobulateBands
  ])

  return {
    apiEnabled: true,
    owned,
    missing: sortByPriceAscendingNullsLast(missing),
    upgrades: sortByPriceAscendingNullsLast(upgrades),
    mpCalculator
  }
}
