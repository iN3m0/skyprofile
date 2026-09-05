import type { AttributeRarity } from './attribute'

/** One side of a fusion recipe — a specific shard plus how many copies it costs. */
export interface FusionIngredient {
  key: string
  name: string
  rarity: AttributeRarity
  /** Copies of this shard needed for one fusion attempt (2 for Elemental/Reptile/Amphibian family shards, 5 otherwise, 1 for Chameleon). */
  fuseAmount: number
  /** Per-copy price, or null if unpriced. */
  unitPrice: number | null
  /** fuseAmount × unitPrice, or null if unpriced. */
  cost: number | null
}

/** The cheapest available recipe for a target shard, picked from every valid input pair by current price. */
export interface FusionRecipe {
  inputA: FusionIngredient
  inputB: FusionIngredient
  /** How many copies of the target one fusion attempt yields (1 or 2). */
  outputCount: number
  /** inputA.cost + inputB.cost, or null if either is unpriced. */
  totalCost: number | null
  /** totalCost / outputCount — the real "cost per shard obtained". */
  costPerOutput: number | null
}

/** One row of the Attribute Calculator's fusion browser. */
export interface FusionTarget {
  key: string
  /** The shard's own name (e.g. "Grove") — what you actually select in the Fusion Machine. */
  name: string
  /** The attribute it grants (e.g. "Nature Elemental") — null on the rare shard this catalog couldn't classify. */
  abilityName: string | null
  rarity: AttributeRarity
  /** Direct buy price (its own bazaar/AH listing), or null if unpriced/untradeable. */
  directPrice: number | null
  /** Cheapest of every valid fusion recipe producing this shard — null if it has no fusion recipe at all (drop/syphon-only). */
  cheapestFusion: FusionRecipe | null
}

export interface AttributeFusionSummary {
  /** Every shard with at least one fusion recipe, cheapest cost-per-shard first (no-price ones last). */
  targets: FusionTarget[]
}

/** One row of "cheapest attributes to max next" — combines a player's current attribute progress with acquisition cost. */
export interface CheapestAttributeToMax {
  key: string
  /** The attribute's ability name (e.g. "Nature Elemental") — what the Attributes tab calls it. */
  name: string
  /** The shard you'd actually buy/fuse for (e.g. "Grove") — null on the rare attribute with no matching shard entry. */
  shardName: string | null
  rarity: AttributeRarity
  stacks: number
  level: number
  /** Shards still needed to reach level 10. */
  shardsNeeded: number
  /** Cheapest way to get one more shard — buying it directly, or fusing for it — whichever is cheaper. Null if neither is priced. */
  costPerShard: number | null
  /** Where costPerShard came from. */
  costSource: 'buy' | 'fusion' | null
  /** shardsNeeded × costPerShard, or null if unpriced. */
  totalCost: number | null
  /** The recipe behind `costPerShard` when costSource is 'fusion' — which two shards to fuse and what each costs. Null otherwise (including when fusing isn't possible at all). */
  fusionRecipe: FusionRecipe | null
}

export interface CheapestAttributesToMaxSummary {
  /** false when the player has no attribute data available for this profile. */
  apiEnabled: boolean
  /** Every not-yet-maxed attribute, cheapest total cost to max first (no-price ones last). */
  attributes: CheapestAttributeToMax[]
}
