import type { BestiaryCategory, BestiarySummary, MobFamily } from '@shared/types/bestiary'
import type { RawHypixelMember } from '../hypixel/profileService'
import { decodeSkinTextureUrl } from '../hypixel/skinTexture'
import { getBestiaryCategories, getBracketThresholds, type RawMobEntry } from './constants'

function resolveIcon(mob: { texture?: string }): string | null {
  return mob.texture ? decodeSkinTextureUrl(mob.texture) : null
}

/** NEU's catalog names carry raw §-color codes (e.g. "§aCreeper") — this app applies rarity/category color externally via CSS rather than parsing per-character runs for a name this simple, so just strip them. */
function stripColorCodes(name: string): string {
  return name.replace(/§./g, '')
}

/**
 * Ported from SkyCrypt's `formatBestiaryMobs`/`getBestiary` (src/stats/bestiary.js):
 * a family's kill count is the sum across every raw variant key it groups
 * (e.g. all 15 `enderman_N` dungeon-floor variants count toward the one
 * "Enderman" family); its tier is how many of the shared bracket's
 * thresholds have been passed, capped at wherever this family's own `cap`
 * sits in that bracket (some families stop well short of the bracket's
 * full 25 tiers).
 */
function buildFamily(mob: RawMobEntry, kills: Record<string, number>): MobFamily {
  const totalKills = mob.mobs.reduce((sum, key) => sum + (kills[key] ?? 0), 0)
  const thresholds = getBracketThresholds(mob)
  const maxTier = thresholds.indexOf(mob.cap) + 1
  const nextTierKills = thresholds.find((t) => totalKills < t && t <= mob.cap) ?? null
  const tier = nextTierKills !== null ? thresholds.indexOf(nextTierKills) : maxTier

  return {
    name: stripColorCodes(mob.name),
    headTextureUrl: resolveIcon(mob),
    kills: totalKills,
    nextTierKills,
    maxKills: mob.cap,
    tier,
    maxTier
  }
}

/** True for the handful of keys every category object carries besides its actual subcategories (Critter Safari currently the only user of this layer). */
function isMetaKey(key: string): boolean {
  return key === 'name' || key === 'icon' || key === 'hasSubcategories'
}

function buildFlattenedCategories(kills: Record<string, number>): BestiaryCategory[] {
  const raw = getBestiaryCategories()
  const categories: BestiaryCategory[] = []

  for (const category of Object.values(raw)) {
    if (category.hasSubcategories) {
      for (const [key, value] of Object.entries(category)) {
        if (isMetaKey(key)) continue
        const sub = value as { name: string; icon?: { texture?: string }; mobs: RawMobEntry[] }
        categories.push({
          name: stripColorCodes(category.name),
          headTextureUrl: resolveIcon(category.icon ?? {}),
          subcategoryName: stripColorCodes(sub.name),
          families: sub.mobs.map((mob) => buildFamily(mob, kills))
        })
      }
    } else if (category.mobs) {
      categories.push({
        name: stripColorCodes(category.name),
        headTextureUrl: resolveIcon(category.icon ?? {}),
        subcategoryName: null,
        families: category.mobs.map((mob) => buildFamily(mob, kills))
      })
    }
  }

  return categories
}

export function computeBestiary(member: RawHypixelMember): BestiarySummary {
  const kills = member.bestiary?.kills
  if (kills === undefined) {
    return {
      apiEnabled: false,
      categories: [],
      milestone: 0,
      maxMilestone: 0,
      familiesUnlocked: 0,
      familiesMaxed: 0,
      totalFamilies: 0
    }
  }

  const categories = buildFlattenedCategories(kills)
  const families = categories.flatMap((c) => c.families)

  return {
    apiEnabled: true,
    categories,
    // This is the *points* total (sum of every family's current tier) —
    // deliberately not the same number as Hypixel's own raw
    // `bestiary.milestone.last_claimed_milestone` despite the shared name.
    // Per the wiki, one milestone *reward* is claimed every 10 points, so
    // the two are related (~10:1) but not equal — don't "fix" this to
    // match the raw field, they're answering different questions.
    milestone: families.reduce((sum, f) => sum + f.tier, 0),
    maxMilestone: families.reduce((sum, f) => sum + f.maxTier, 0),
    familiesUnlocked: families.filter((f) => f.kills > 0).length,
    familiesMaxed: families.filter((f) => f.tier === f.maxTier).length,
    totalFamilies: families.length
  }
}
