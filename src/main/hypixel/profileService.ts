import { hypixelGet } from './client'
import { HypixelPaths } from './endpoints'
import { getOrFetch } from '../cache/cacheStore'

/**
 * Raw Hypixel `skyblock/profile` member shape, unprocessed. Each domain
 * service (skills, collections, and later inventory/pets/networth) reads
 * whatever sub-fields it needs directly off this rather than us maintaining
 * a full hand-typed mirror of Hypixel's schema up front.
 */
export interface RawHypixelProfile {
  profile_id: string
  cute_name: string
  game_mode?: string
  /** Epoch ms this SkyBlock profile itself was created. */
  created_at?: number
  members: Record<string, RawHypixelMember>
  banking?: { balance: number }
  /** Shared across every co-op member on the profile, not per-member. */
  shared_inventory?: {
    candy_inventory_contents?: { data: string }
  }
  community_upgrades?: {
    upgrade_states?: { upgrade: string; tier: number }[]
  }
}

export interface RawHypixelMember {
  /** Overall SkyBlock Level XP — 100 XP per level, no cumulative table needed. */
  leveling?: {
    experience?: number
  }
  player_data?: {
    experience?: Record<string, number>
    unlocked_coll_tiers?: string[]
    /** "<TYPE>_<tier>" entries, e.g. "COBBLESTONE_7" — the highest tier per type is that minion's current level. */
    crafted_generators?: string[]
  }
  /** Farming skill's level cap above the base 50 comes from medals spent here — see skills/constants.ts. */
  jacobs_contest?: {
    perks?: {
      farming_level_cap?: number
    }
  }
  collection?: Record<string, number>
  pets_data?: {
    pets?: unknown[]
  }
  bestiary?: {
    kills?: Record<string, number>
  }
  attributes?: {
    stacks?: Record<string, number>
  }
  slayer?: {
    slayer_quest?: {
      type?: string
      tier?: number
      completion_state?: number
    }
    slayer_bosses?: Record<string, Record<string, unknown>>
  }
  dungeons?: {
    dungeon_types?: {
      catacombs?: {
        experience?: number
        tier_completions?: Record<string, number>
        best_score?: Record<string, number>
        fastest_time?: Record<string, number>
        highest_tier_completed?: number
      }
      master_catacombs?: {
        tier_completions?: Record<string, number>
        best_score?: Record<string, number>
        fastest_time?: Record<string, number>
      }
    }
    player_classes?: Record<string, { experience?: number }>
    selected_dungeon_class?: string
    secrets?: number
  }
  inventory?: {
    inv_armor?: { data: string }
    inv_contents?: { data: string }
    ender_chest_contents?: { data: string }
    wardrobe_contents?: { data: string }
    equipment_contents?: { data: string }
    personal_vault_contents?: { data: string }
    bag_contents?: {
      talisman_bag?: { data: string }
      fishing_bag?: { data: string }
      quiver?: { data: string }
      potion_bag?: { data: string }
    }
  }
  [key: string]: unknown
}

interface RawProfileResponse {
  success: boolean
  profile: RawHypixelProfile | null
}

export class ProfileNotFoundError extends Error {
  constructor(profileId: string) {
    super(`Profile "${profileId}" was not found`)
    this.name = 'ProfileNotFoundError'
  }
}

const PROFILE_CACHE_TTL_MS = 60_000

/**
 * Fetches a full Skyblock profile (all co-op members), cached briefly so
 * flipping between tabs for the same profile doesn't re-hit Hypixel on
 * every click. Not persisted — v1 is snapshot-only.
 */
export async function getRawProfile(profileId: string): Promise<RawHypixelProfile> {
  return getOrFetch(`profile:${profileId}`, PROFILE_CACHE_TTL_MS, async () => {
    const data = await hypixelGet<RawProfileResponse>(HypixelPaths.skyblockProfile, {
      profile: profileId
    })
    if (!data.profile) throw new ProfileNotFoundError(profileId)
    return data.profile
  })
}

export function normalizeUuid(uuid: string): string {
  return uuid.replace(/-/g, '').toLowerCase()
}

/**
 * Looks up a member by UUID, tolerant of dash formatting — Hypixel keys
 * `profile.members` by *undashed* UUIDs, while the rest of this app (and
 * Mojang/playerdb's responses) use dashed ones, so a direct key lookup
 * fails silently otherwise.
 */
export function getMember(profile: RawHypixelProfile, uuid: string): RawHypixelMember {
  const target = normalizeUuid(uuid)
  const entry = Object.entries(profile.members).find(([key]) => normalizeUuid(key) === target)
  if (!entry) {
    throw new Error(`UUID ${uuid} is not a member of profile ${profile.profile_id}`)
  }
  return entry[1]
}
