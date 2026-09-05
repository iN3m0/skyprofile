import type {
  AttributeFusionSummary,
  CheapestAttributeToMax,
  CheapestAttributesToMaxSummary,
  FusionIngredient,
  FusionRecipe,
  FusionTarget
} from '@shared/types/attributeFusion'
import type { RawHypixelMember } from '../hypixel/profileService'
import {
  ATTRIBUTE_DEFINITIONS,
  ATTRIBUTE_LEVEL_THRESHOLDS,
  type AttributeDefinition
} from './constants'
import { computeAttributes } from './attributeService'
// skyhelper-networth is already a project dependency (accessories/networth
// both reuse its price list) — same source here for shard prices.
import { getPrices } from 'skyhelper-networth'
import fusionDataRaw from './data/fusion-data.json'

interface RawFusionShard {
  name: string
  fuse_amount: number
}

interface RawFusionData {
  shards: Record<string, RawFusionShard>
  recipes: Record<string, Record<string, [string, string][]>>
}

// See data/README.md for full provenance — this is Campionnn/SkyShards-Parser's
// dist/fusion-data.json, copied verbatim.
const FUSION_DATA = fusionDataRaw as unknown as RawFusionData

// SkyShards keys its 322 shards by its own ids (C1, U5, R30, ...), not this
// app's attributes.json `internalKey` — cross-referenced by exact shard
// *name* match (both call it e.g. "Grove"), verified 322/322 resolve.
const catalogByShardName = new Map<string, AttributeDefinition>()
for (const def of ATTRIBUTE_DEFINITIONS) {
  if (def.shardName) catalogByShardName.set(def.shardName, def)
}

const fusionIdByInternalKey = new Map<string, string>()
for (const [id, raw] of Object.entries(FUSION_DATA.shards)) {
  const def = catalogByShardName.get(raw.name)
  if (def) fusionIdByInternalKey.set(def.internalKey, id)
}

const shardNameByInternalKey = new Map<string, string>()
for (const def of ATTRIBUTE_DEFINITIONS) {
  if (def.shardName) shardNameByInternalKey.set(def.internalKey, def.shardName)
}

function priceOfKey(internalKey: string, prices: Record<string, number>): number | null {
  return prices[`ATTRIBUTE_SHARD_${internalKey.toUpperCase()}`] ?? null
}

function buildIngredient(
  fusionId: string,
  prices: Record<string, number>
): FusionIngredient | null {
  const raw = FUSION_DATA.shards[fusionId]
  const def = raw && catalogByShardName.get(raw.name)
  if (!raw || !def) return null

  const unitPrice = priceOfKey(def.internalKey, prices)
  return {
    key: def.internalKey,
    name: raw.name,
    rarity: def.rarity,
    fuseAmount: raw.fuse_amount,
    unitPrice,
    cost: unitPrice !== null ? unitPrice * raw.fuse_amount : null
  }
}

/**
 * The cheapest of every valid recipe producing `fusionId`, by current
 * price. Many of a common target's recipes are redundant (any same-
 * rarity-or-higher shard satisfies a generic ID-Fusion criterion) — rather
 * than trusting one baked-in "best" pick that would go stale as prices
 * move, this re-evaluates all of them live. Falls back to *some* valid
 * recipe (unpriced) if nothing has price data, so the browser can still
 * show "this is fusable" rather than hiding it.
 */
function cheapestRecipe(fusionId: string, prices: Record<string, number>): FusionRecipe | null {
  const byCount = FUSION_DATA.recipes[fusionId]
  if (!byCount) return null

  let best: FusionRecipe | null = null
  for (const [countStr, pairs] of Object.entries(byCount)) {
    const outputCount = Number(countStr)
    for (const [aId, bId] of pairs) {
      const inputA = buildIngredient(aId, prices)
      const inputB = buildIngredient(bId, prices)
      if (!inputA || !inputB) continue

      const totalCost =
        inputA.cost !== null && inputB.cost !== null ? inputA.cost + inputB.cost : null
      const costPerOutput = totalCost !== null ? totalCost / outputCount : null
      const candidate: FusionRecipe = { inputA, inputB, outputCount, totalCost, costPerOutput }

      if (best === null) {
        best = candidate
      } else if (
        costPerOutput !== null &&
        (best.costPerOutput === null || costPerOutput < best.costPerOutput)
      ) {
        best = candidate
      }
    }
  }
  return best
}

/**
 * The Attribute Calculator's fusion browser: every shard obtainable via
 * fusion, cheapest cost-per-shard first. `force: true` bypasses
 * skyhelper-networth's 5-minute price cache — a manual "refresh after
 * buying" for the renderer.
 */
export async function computeAttributeFusion(force = false): Promise<AttributeFusionSummary> {
  const prices = await getPrices(!force).catch(() => ({}) as Record<string, number>)

  const targets: FusionTarget[] = []
  for (const [id, raw] of Object.entries(FUSION_DATA.shards)) {
    const def = catalogByShardName.get(raw.name)
    if (!def) continue

    const cheapestFusion = cheapestRecipe(id, prices)
    if (!cheapestFusion) continue // no fusion recipe at all — drop/syphon-only shard, not fusable

    targets.push({
      key: def.internalKey,
      name: raw.name,
      abilityName: def.abilityName,
      rarity: def.rarity,
      directPrice: priceOfKey(def.internalKey, prices),
      cheapestFusion
    })
  }

  targets.sort((a, b) => {
    const ac = a.cheapestFusion?.costPerOutput ?? null
    const bc = b.cheapestFusion?.costPerOutput ?? null
    if (ac === null && bc === null) return 0
    if (ac === null) return 1
    if (bc === null) return -1
    return ac - bc
  })

  return { targets }
}

/**
 * "Cheapest attributes to max next": for every not-yet-level-10 attribute
 * the player has, the shards still needed to reach max, priced at
 * whichever's cheaper right now — buying the shard directly, or fusing for
 * it — ranked by total coins to finish it. `force: true` bypasses
 * skyhelper-networth's 5-minute price cache (the caller is responsible for
 * also invalidating the profile cache so `member` itself is fresh).
 */
export async function computeCheapestAttributesToMax(
  member: RawHypixelMember,
  force = false
): Promise<CheapestAttributesToMaxSummary> {
  const attrSummary = computeAttributes(member)
  if (!attrSummary.apiEnabled) return { apiEnabled: false, attributes: [] }

  const prices = await getPrices(!force).catch(() => ({}) as Record<string, number>)

  const attributes: CheapestAttributeToMax[] = []
  for (const attr of attrSummary.attributes) {
    if (attr.level >= attr.maxLevel) continue

    const thresholds = ATTRIBUTE_LEVEL_THRESHOLDS[attr.rarity]
    const maxStacks = thresholds[thresholds.length - 1]
    const shardsNeeded = Math.max(0, maxStacks - attr.stacks)
    if (shardsNeeded === 0) continue

    const directPrice = priceOfKey(attr.key, prices)
    const fusionId = fusionIdByInternalKey.get(attr.key)
    const fusion = fusionId ? cheapestRecipe(fusionId, prices) : null
    const fusionCost = fusion?.costPerOutput ?? null

    let costPerShard: number | null = null
    let costSource: 'buy' | 'fusion' | null = null
    if (directPrice !== null && (fusionCost === null || directPrice <= fusionCost)) {
      costPerShard = directPrice
      costSource = 'buy'
    } else if (fusionCost !== null) {
      costPerShard = fusionCost
      costSource = 'fusion'
    }

    attributes.push({
      key: attr.key,
      name: attr.displayName,
      shardName: shardNameByInternalKey.get(attr.key) ?? null,
      rarity: attr.rarity,
      stacks: attr.stacks,
      level: attr.level,
      shardsNeeded,
      costPerShard,
      costSource,
      totalCost: costPerShard !== null ? costPerShard * shardsNeeded : null,
      fusionRecipe: costSource === 'fusion' ? fusion : null
    })
  }

  attributes.sort((a, b) => {
    if (a.totalCost === null && b.totalCost === null) return 0
    if (a.totalCost === null) return 1
    if (b.totalCost === null) return -1
    return a.totalCost - b.totalCost
  })

  return { apiEnabled: true, attributes }
}
