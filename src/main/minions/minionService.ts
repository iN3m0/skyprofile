import type { MinionsSummary } from '@shared/types/minion'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { getMinionDefinitions } from '../hypixel/resources'
import {
  CRAFTED_MINION_SLOT_TIERS,
  MAX_BONUS_MINION_SLOT_TIERS,
  getMinionCategory
} from './constants'

/**
 * `player_data.crafted_generators` is a flat list of "<TYPE>_<tier>"
 * entries (e.g. "COBBLESTONE_7") — not necessarily every tier in between,
 * just whichever were individually recorded as crafted, so a type's
 * *current* tier is the highest number seen for it, not the array's
 * length.
 */
function groupHighestTierByType(craftedGenerators: string[]): Map<string, number> {
  const highest = new Map<string, number>()
  for (const entry of craftedGenerators) {
    const match = /^(.*)_(\d+)$/.exec(entry)
    if (!match) continue
    const [, type, tierStr] = match
    const tier = Number(tierStr)
    if (tier > (highest.get(type) ?? 0)) highest.set(type, tier)
  }
  return highest
}

/**
 * Every minion type's highest crafted tier, aggregated across every co-op
 * member (not just the one being viewed — see the note below on why that
 * matters) — exported for the SkyBlock XP Calculator, which needs the
 * same "what's already been crafted" data `computeMinions` does, just
 * reshaped into per-(type, tier) opportunities rather than a display list.
 */
export function getOwnedMinionTiersByType(profile: RawHypixelProfile): Map<string, number> {
  const allCraftedGenerators = Object.values(profile.members).flatMap(
    (m) => m.player_data?.crafted_generators ?? []
  )
  return groupHighestTierByType(allCraftedGenerators)
}

/**
 * The wiki's own wording ("creating new unique minion types or a higher
 * level minion of the same type") reads as if this should just be
 * `crafted_generators.length`, but that undercounts badly — verified
 * against a live profile where the raw array (515 entries) put the user
 * three tiers of slot-progress behind their real in-game total. The raw
 * array is sparse (recorded upgrade events, not a live-maintained "every
 * tier 1..N" record — e.g. it can hold `REDSTONE_1` and `REDSTONE_12`
 * with none of the tiers between), while reaching tier 12 necessarily
 * passed through every tier below it. Summing each type's *highest*
 * tier — effectively treating all its lower tiers as implicitly also
 * "crafted" — landed within a few points of the real total instead of
 * dozens off, so that's what this counts against the table.
 */
function getCraftedSlots(uniqueMinionsCrafted: number): {
  slots: number
  toNextSlot: number | null
} {
  let slots = CRAFTED_MINION_SLOT_TIERS[0].slots
  let toNextSlot: number | null = null

  for (let i = 0; i < CRAFTED_MINION_SLOT_TIERS.length; i++) {
    const tier = CRAFTED_MINION_SLOT_TIERS[i]
    if (uniqueMinionsCrafted >= tier.uniqueRequired) {
      slots = tier.slots
      const next = CRAFTED_MINION_SLOT_TIERS[i + 1]
      toNextSlot = next ? next.uniqueRequired - uniqueMinionsCrafted : null
    }
  }

  return { slots, toNextSlot }
}

function getBonusMinionSlots(profile: RawHypixelProfile): number {
  const states = profile.community_upgrades?.upgrade_states ?? []
  const tiers = states.filter((s) => s.upgrade === 'minion_slots').map((s) => s.tier)
  return tiers.length > 0 ? Math.max(...tiers) : 0
}

export async function computeMinions(
  profile: RawHypixelProfile,
  member: RawHypixelMember
): Promise<MinionsSummary> {
  const craftedGenerators = member.player_data?.crafted_generators
  if (craftedGenerators === undefined) {
    return {
      apiEnabled: false,
      minions: [],
      missing: [],
      uniqueMinions: 0,
      maxedMinions: 0,
      totalTypes: 0,
      craftedMinionSlots: 0,
      uniqueMinionsToNextSlot: null,
      bonusMinionSlots: 0,
      maxBonusMinionSlots: MAX_BONUS_MINION_SLOT_TIERS
    }
  }

  // Minions live on the shared island, not per-member — crediting only the
  // viewed member's own crafting history misses everything a co-op
  // partner crafted (confirmed as a real bug: a Sheep Minion crafted by
  // another member showed as "missing" here despite being on the shared
  // island). Slot-unlock progress is shared the same way, so both need
  // every member's history merged in, not just the one being viewed.
  const ownedTiers = getOwnedMinionTiersByType(profile)
  const definitions = await getMinionDefinitions()

  const minions = definitions
    .filter((def) => ownedTiers.has(def.type))
    .map((def) => ({
      type: def.type,
      name: def.name,
      category: getMinionCategory(def.type),
      tier: ownedTiers.get(def.type) as number,
      maxTier: def.maxTier,
      headTextureUrl: def.headTextureUrl
    }))
    .sort((a, b) => (a.tier === b.tier ? a.name.localeCompare(b.name) : b.tier - a.tier))

  const missing = definitions
    .filter((def) => !ownedTiers.has(def.type))
    .map((def) => ({
      type: def.type,
      name: def.name,
      category: getMinionCategory(def.type),
      maxTier: def.maxTier,
      headTextureUrl: def.headTextureUrl
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  const uniqueMinionsCrafted = [...ownedTiers.values()].reduce((sum, tier) => sum + tier, 0)
  const { slots: craftedMinionSlots, toNextSlot: uniqueMinionsToNextSlot } =
    getCraftedSlots(uniqueMinionsCrafted)

  return {
    apiEnabled: true,
    minions,
    missing,
    uniqueMinions: minions.length,
    maxedMinions: minions.filter((m) => m.tier >= m.maxTier).length,
    totalTypes: definitions.length,
    craftedMinionSlots,
    uniqueMinionsToNextSlot,
    bonusMinionSlots: getBonusMinionSlots(profile),
    maxBonusMinionSlots: MAX_BONUS_MINION_SLOT_TIERS
  }
}
