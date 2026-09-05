// Shared by every "cheapest cost" calculator that needs a real crafting
// recipe tree (Museum, Minions, ...) — extracted here once both needed it,
// rather than duplicated. See src/main/museum/data/README.md's
// `craftRecipes.json` section for where this data comes from and why.
import craftRecipesRaw from '../museum/data/craftRecipes.json'

interface RawRecipe {
  /** [ingredientId, count] pairs — a flattened 3x3 crafting grid. */
  i: [string, number][]
  /** How many copies of the item this recipe yields. */
  o: number
}
const CRAFT_RECIPES = craftRecipesRaw as unknown as Record<string, RawRecipe>

export interface ResolvedCost {
  cost: number | null
  source: 'buy' | 'craft' | null
}

/** A fresh memoization cache for one calculation pass — pass the same one across every `resolveCost`/`cheapestCost` call in that pass so shared sub-ingredients (e.g. an enchanted material several items need) aren't re-resolved. */
export function createCraftCostCache(): Map<string, number | null> {
  return new Map()
}

/**
 * The cheapest known cost to obtain one copy of `itemId` — its own AH/
 * bazaar price, or the cost to craft it from sub-ingredients (each
 * resolved the same way, recursively), whichever is cheaper. Guarded
 * against recipe cycles (`resolving`) — none are known to exist in this
 * data, but a cycle silently producing Infinity/NaN would be worse than
 * just refusing to price it. `freeIds` treats an ingredient as already
 * owned (cost 0) rather than re-pricing it — e.g. a Minion's next tier
 * needs the previous tier as an ingredient, which the player already has
 * if they're asking "what does the next tier cost," so it shouldn't be
 * priced as if bought again from scratch.
 */
export function cheapestCost(
  itemId: string,
  prices: Record<string, number>,
  cache: Map<string, number | null>,
  resolving: Set<string>,
  freeIds: ReadonlySet<string> = EMPTY_SET
): number | null {
  if (freeIds.has(itemId)) return 0

  const cached = cache.get(itemId)
  if (cached !== undefined) return cached
  if (resolving.has(itemId)) return null

  const direct = prices[itemId] ?? null
  const crafted = craftCost(itemId, prices, cache, resolving, freeIds)
  const result =
    direct !== null && crafted !== null ? Math.min(direct, crafted) : (direct ?? crafted)

  cache.set(itemId, result)
  return result
}

export function craftCost(
  itemId: string,
  prices: Record<string, number>,
  cache: Map<string, number | null>,
  resolving: Set<string>,
  freeIds: ReadonlySet<string> = EMPTY_SET
): number | null {
  const recipe = CRAFT_RECIPES[itemId]
  if (!recipe) return null

  resolving.add(itemId)
  let total = 0
  for (const [ingredientId, count] of recipe.i) {
    const cost = cheapestCost(ingredientId, prices, cache, resolving, freeIds)
    if (cost === null) {
      resolving.delete(itemId)
      return null
    }
    total += cost * count
  }
  resolving.delete(itemId)

  return total / recipe.o
}

/** Same as `cheapestCost`, but also reports which source won — only meaningful at the top level the caller actually shows a price for. */
export function resolveCost(
  itemId: string,
  prices: Record<string, number>,
  cache: Map<string, number | null>,
  freeIds: ReadonlySet<string> = EMPTY_SET
): ResolvedCost {
  const direct = prices[itemId] ?? null
  const crafted = craftCost(itemId, prices, cache, new Set(), freeIds)

  if (direct !== null && crafted !== null) {
    return direct <= crafted ? { cost: direct, source: 'buy' } : { cost: crafted, source: 'craft' }
  }
  if (direct !== null) return { cost: direct, source: 'buy' }
  if (crafted !== null) return { cost: crafted, source: 'craft' }
  return { cost: null, source: null }
}

const EMPTY_SET: ReadonlySet<string> = new Set()
