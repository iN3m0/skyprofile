import type { Attribute, AttributeRarity, AttributesSummary, UnclassifiedAttribute } from '@shared/types/attribute'
import type { RawHypixelMember } from '../hypixel/profileService'
import { ATTRIBUTE_DEFINITIONS, ATTRIBUTE_LEVEL_THRESHOLDS, MAX_ATTRIBUTE_LEVEL } from './constants'

const RARITY_ORDER: AttributeRarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']

function getLevel(stacks: number, rarity: AttributeRarity): { level: number; stacksForNextLevel: number | null } {
  const thresholds = ATTRIBUTE_LEVEL_THRESHOLDS[rarity]
  if (stacks <= 0) return { level: 0, stacksForNextLevel: thresholds[0] }
  let level = 0
  for (const threshold of thresholds) {
    if (stacks >= threshold) level++
  }
  const next = thresholds[level]
  return { level, stacksForNextLevel: next !== undefined ? next - stacks : null }
}

export function computeAttributes(member: RawHypixelMember): AttributesSummary {
  const stacks = member.attributes?.stacks
  if (stacks === undefined) {
    return {
      apiEnabled: false,
      attributes: [],
      unclassified: [],
      ownedCount: 0,
      maxedCount: 0,
      totalCatalogued: ATTRIBUTE_DEFINITIONS.length
    }
  }

  const ownedStacksByKey = new Map(Object.entries(stacks))
  const unclassified: UnclassifiedAttribute[] = []

  // Every catalogued attribute is shown regardless of ownership (the same
  // "show the whole checklist, not just what's started" approach as
  // Bestiary) — an unowned one just renders at 0 stacks / level 0.
  const attributes: Attribute[] = ATTRIBUTE_DEFINITIONS.map((def) => {
    const ownedStacks = ownedStacksByKey.get(def.internalKey)
    const owned = ownedStacks !== undefined
    const { level, stacksForNextLevel } = getLevel(ownedStacks ?? 0, def.rarity)
    ownedStacksByKey.delete(def.internalKey)

    return {
      key: def.internalKey,
      displayName: def.abilityName,
      rarity: def.rarity,
      family: def.family,
      skill: def.skill,
      effect: def.effect,
      owned,
      stacks: ownedStacks ?? 0,
      level,
      maxLevel: MAX_ATTRIBUTE_LEVEL,
      stacksForNextLevel
    }
  })

  // Whatever's left is a raw key that was owned but never matched a
  // catalog entry — the catalog is keyed by Hypixel's own stable internal
  // ids now (see data/README.md) and covers 100% of a live profile this
  // was verified against, so this should be empty in practice; kept as a
  // graceful fallback rather than assumed permanent.
  for (const [key, rawStacks] of ownedStacksByKey) {
    unclassified.push({ key, stacks: rawStacks })
  }

  attributes.sort((a, b) => {
    if (a.rarity !== b.rarity) return RARITY_ORDER.indexOf(b.rarity) - RARITY_ORDER.indexOf(a.rarity)
    if (a.level !== b.level) return b.level - a.level
    return a.displayName.localeCompare(b.displayName)
  })
  unclassified.sort((a, b) => b.stacks - a.stacks)

  return {
    apiEnabled: true,
    attributes,
    unclassified,
    ownedCount: attributes.filter((a) => a.owned).length,
    maxedCount: attributes.filter((a) => a.level >= a.maxLevel).length,
    totalCatalogued: ATTRIBUTE_DEFINITIONS.length
  }
}
