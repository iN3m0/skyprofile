import type { MuseumCategory, MuseumItem, MuseumSummary } from '@shared/types/museum'
import type { Rarity } from '@shared/types/item'
import { hypixelGet } from '../hypixel/client'
import { HypixelPaths } from '../hypixel/endpoints'
import { getOrFetch } from '../cache/cacheStore'
import { normalizeUuid } from '../hypixel/profileService'
import { decodeInventoryData } from '../nbt/decodeItems'
import { getItemDefinitionsById, getItemSkinUrls } from '../hypixel/resources'
import {
  getMuseumSetDisplayName,
  MUSEUM_CATEGORY_ITEMS,
  MUSEUM_CATEGORY_NAMES,
  MUSEUM_CATEGORY_ORDER,
  resolveMuseumDisplayId
} from './constants'

interface RawMuseumItemEntry {
  donated_time?: number
  items: { type: number; data: string }
}

interface RawMuseumSpecialEntry extends RawMuseumItemEntry {
  id: string
}

interface RawMuseumMember {
  value?: number
  items?: Record<string, RawMuseumItemEntry>
  special?: RawMuseumSpecialEntry[]
}

export interface RawMuseumResponse {
  success: boolean
  members?: Record<string, RawMuseumMember>
}

const MUSEUM_CACHE_TTL_MS = 60_000

/** Exported for networth calculation reuse — `skyhelper-networth` wants the same per-member museum object this module already fetches (`museum.members[uuid]`). */
export async function getRawMuseum(profileId: string): Promise<RawMuseumResponse> {
  return getOrFetch(`museum:${profileId}`, MUSEUM_CACHE_TTL_MS, () =>
    hypixelGet<RawMuseumResponse>(HypixelPaths.skyblockMuseum, { profile: profileId })
  )
}

function stripColorCodes(name: string): string {
  return name.replace(/§./g, '')
}

interface DecodedDonation {
  name: string
  rarity: Rarity | null
  headTextureUrl: string | null
  displayName: string
  lore: string[]
}

/** Decodes every donation's NBT in parallel and keys the result by item id — a slot's NBT is always a single item, same shape `decodeInventoryData` already handles for inventory containers. */
async function decodeDonations<T extends RawMuseumItemEntry>(
  entries: [string, T][],
  skinUrls: Record<string, string>
): Promise<Map<string, DecodedDonation>> {
  const decoded = await Promise.all(
    entries.map(async ([itemId, entry]) => {
      const items = await decodeInventoryData(entry.items.data)
      return [itemId, items[0]] as const
    })
  )

  const result = new Map<string, DecodedDonation>()
  for (const [itemId, item] of decoded) {
    if (!item) continue
    result.set(itemId, {
      name: stripColorCodes(item.displayName) || itemId,
      rarity: item.rarity,
      headTextureUrl: (item.itemId && skinUrls[item.itemId]) || null,
      displayName: item.displayName,
      lore: item.lore
    })
  }
  return result
}

export async function computeMuseum(profileId: string, uuid: string): Promise<MuseumSummary> {
  const raw = await getRawMuseum(profileId)
  const target = normalizeUuid(uuid)
  const memberEntry = Object.entries(raw.members ?? {}).find(
    ([key]) => normalizeUuid(key) === target
  )
  const member = memberEntry?.[1]

  if (!member) {
    return { apiEnabled: false, value: 0, categories: [], donatedCount: 0, totalCatalogued: 0 }
  }

  const [itemDefs, skinUrls] = await Promise.all([getItemDefinitionsById(), getItemSkinUrls()])

  const [donatedNormal, donatedSpecial] = await Promise.all([
    decodeDonations(Object.entries(member.items ?? {}), skinUrls),
    decodeDonations(
      (member.special ?? []).map((entry) => [entry.id, entry] as [string, RawMuseumSpecialEntry]),
      skinUrls
    )
  ])

  const categories: MuseumCategory[] = MUSEUM_CATEGORY_ORDER.map((key) => {
    const ids = MUSEUM_CATEGORY_ITEMS[key] ?? []
    const donatedMap = key === 'special' ? donatedSpecial : donatedNormal

    const items: MuseumItem[] = ids.map((itemId) => {
      const donated = donatedMap.get(itemId)
      // Donation-matching (`itemId` above) uses the catalog's own base id —
      // that's what the real donation data is keyed by, confirmed live.
      // But a real name/rarity/icon lookup needs the *resolved* id: an
      // armor-set entry like "MELON" isn't a real Hypixel item on its own
      // (it coincidentally collides with the real, unrelated Melon crop
      // item) — only its resolved id ("MELON_HELMET") is.
      const displayId = resolveMuseumDisplayId(itemId)
      const def = itemDefs[displayId]
      if (donated) {
        return {
          itemId: displayId,
          name: donated.name || def?.name || itemId,
          rarity: donated.rarity ?? (def?.rarity as Rarity | null) ?? null,
          headTextureUrl: donated.headTextureUrl ?? def?.headTextureUrl ?? null,
          donated: true,
          displayName: donated.displayName,
          lore: donated.lore
        }
      }
      return {
        itemId: displayId,
        // An undonated slot's own real name ("Tater Helmet") reads as one
        // specific piece, not the set it actually represents — prefer the
        // set-derived name ("Melon Armor") when this is a set at all.
        name: getMuseumSetDisplayName(itemId) ?? def?.name ?? itemId,
        rarity: (def?.rarity as Rarity | null) ?? null,
        headTextureUrl: def?.headTextureUrl ?? null,
        donated: false,
        displayName: null,
        lore: null
      }
    })

    return {
      key,
      name: MUSEUM_CATEGORY_NAMES[key] ?? key,
      items,
      donatedCount: items.filter((i) => i.donated).length,
      totalCount: items.length
    }
  })

  // "Special" is excluded from the overall total — it's a grab-bag of
  // event/novelty/legacy items (335 of them) rather than the kind of
  // steady collectible checklist the other 7 categories are, and even
  // Hypixel's own museum scoring treats it as a much smaller, differently
  // -counted bucket (per NEU-REPO's own `max_values`: 48, not 335) rather
  // than folding it into the same denominator 1:1. The category itself is
  // still shown in the tab, just not counted toward this header stat.
  const countedCategories = categories.filter((c) => c.key !== 'special')

  return {
    apiEnabled: true,
    value: member.value ?? 0,
    categories,
    donatedCount: countedCategories.reduce((sum, c) => sum + c.donatedCount, 0),
    totalCatalogued: countedCategories.reduce((sum, c) => sum + c.totalCount, 0)
  }
}
