import { hypixelGetPublic } from './client'
import { HypixelPaths } from './endpoints'
import { getOrFetch } from '../cache/cacheStore'
import { decodeSkinTextureUrl } from './skinTexture'

/** Raw shape of GET /v2/resources/skyblock/collections (no API key required). */
export interface RawCollectionsResource {
  success: boolean
  collections: Record<
    string,
    {
      name: string
      items: Record<
        string,
        {
          name: string
          maxTiers: number
          tiers: Array<{ tier: number; amountRequired: number }>
        }
      >
    }
  >
}

export interface RawItemDefinition {
  id: string
  name: string
  material: string
  tier?: string
  category?: string
  skin?: { value: string }
  /** Present only on minion items — the base resource type, e.g. "COBBLESTONE". */
  generator?: string
  generator_tier?: number
}

/** Raw shape of GET /v2/resources/skyblock/items (no API key required). */
interface RawItemsResource {
  success: boolean
  items: RawItemDefinition[]
}

const RESOURCE_CACHE_TTL_MS = 24 * 60 * 60 * 1000

export async function getCollectionsResource(): Promise<RawCollectionsResource> {
  return getOrFetch('resource:collections', RESOURCE_CACHE_TTL_MS, () =>
    hypixelGetPublic<RawCollectionsResource>(HypixelPaths.resourceCollections)
  )
}

/**
 * The full `resources/skyblock/items` list (~5000+ entries), fetched and
 * cached once — `getItemSkinUrls` and `getAccessoryDefinitions` both
 * derive from this rather than each re-fetching the same ~5MB payload.
 */
async function getItemsResource(): Promise<RawItemDefinition[]> {
  return getOrFetch('resource:items', RESOURCE_CACHE_TTL_MS, async () => {
    const data = await hypixelGetPublic<RawItemsResource>(HypixelPaths.resourceItems)
    return data.items
  })
}

/**
 * Many custom Skyblock-only items (no vanilla equivalent) are implemented
 * as player-head items with a custom skin — the same mechanism used for
 * pets/cosmetics. Decodes each item's base64 `skin.value` (a standard
 * Mojang profile-property blob) down to just the `textures.minecraft.net`
 * skin URL, so the renderer can crop the face region out via CSS without
 * ever needing to touch the raw profile blob itself. Trimmed to only
 * items that actually have a skin, to keep this small over IPC.
 */
export async function getItemSkinUrls(): Promise<Record<string, string>> {
  return getOrFetch('resource:itemSkins', RESOURCE_CACHE_TTL_MS, async () => {
    const items = await getItemsResource()
    const urls: Record<string, string> = {}
    for (const item of items) {
      if (!item.skin?.value) continue
      const url = decodeSkinTextureUrl(item.skin.value)
      if (url) urls[item.id] = url
    }
    return urls
  })
}

export interface GeneralItemDefinition {
  id: string
  name: string
  rarity: string | null
  headTextureUrl: string | null
}

/**
 * Every item Hypixel's catalog knows about, keyed by id — a general
 * lookup (name/rarity/icon) for callers that need to describe an item
 * they only have the id for (e.g. a Museum catalog entry that hasn't been
 * donated yet, so there's no NBT instance to read those off of).
 */
export async function getItemDefinitionsById(): Promise<Record<string, GeneralItemDefinition>> {
  return getOrFetch('resource:itemDefinitions', RESOURCE_CACHE_TTL_MS, async () => {
    const items = await getItemsResource()
    const byId: Record<string, GeneralItemDefinition> = {}
    for (const item of items) {
      byId[item.id] = {
        id: item.id,
        name: item.name,
        rarity: item.tier ? item.tier.toLowerCase() : null,
        headTextureUrl: item.skin?.value ? decodeSkinTextureUrl(item.skin.value) : null
      }
    }
    return byId
  })
}

export interface AccessoryDefinition {
  id: string
  name: string
  rarity: string | null
  material: string
}

/** Every item Hypixel tags as an accessory — the master list "missing accessories" is computed against. */
export async function getAccessoryDefinitions(): Promise<AccessoryDefinition[]> {
  return getOrFetch('resource:accessories', RESOURCE_CACHE_TTL_MS, async () => {
    const items = await getItemsResource()
    return items
      .filter((item) => item.category === 'ACCESSORY')
      .map((item) => ({
        id: item.id,
        name: item.name,
        rarity: item.tier ? item.tier.toLowerCase() : null,
        material: item.material
      }))
  })
}

export interface MinionDefinition {
  /** Base resource type, e.g. "COBBLESTONE" — matches the prefix on `player_data.crafted_generators` entries. */
  type: string
  name: string
  maxTier: number
  /** Tier-1 item's icon — minions don't visually change per tier, so this is representative of the whole family. */
  headTextureUrl: string | null
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Every minion family Hypixel's own item catalog knows about, derived
 * entirely from live `resources/skyblock/items` data (every minion tier is
 * its own item entry carrying `generator`/`generator_tier`) rather than
 * any ported/curated table — unlike accessories or pets, Hypixel's
 * resource endpoint already has everything needed here, so there's no
 * staleness risk to work around.
 */
export async function getMinionDefinitions(): Promise<MinionDefinition[]> {
  return getOrFetch('resource:minions', RESOURCE_CACHE_TTL_MS, async () => {
    const items = await getItemsResource()
    const byType = new Map<string, RawItemDefinition[]>()
    for (const item of items) {
      if (item.generator === undefined || item.generator_tier === undefined) continue
      const list = byType.get(item.generator) ?? []
      list.push(item)
      byType.set(item.generator, list)
    }

    const definitions: MinionDefinition[] = []
    for (const [type, entries] of byType) {
      const maxTier = Math.max(...entries.map((e) => e.generator_tier as number))
      const tierOne = entries.find((e) => e.generator_tier === 1) ?? entries[0]
      definitions.push({
        type,
        name: `${titleCase(type)} Minion`,
        maxTier,
        headTextureUrl: tierOne.skin?.value ? decodeSkinTextureUrl(tierOne.skin.value) : null
      })
    }
    return definitions
  })
}
