import type { MissingPet, Pet, PetRarity, PetsSummary } from '@shared/types/pet'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { PET_DATA, PET_LEVELS, PET_RARITY_OFFSET, PET_REWARDS, PET_VALUE, UNKNOWN_HEAD, type PetDefinition } from './constants'

/** Ascending rarity order — index doubles as the tier-boost/cap comparison used below. */
const PET_RARITIES: PetRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

/** SkyCrypt's own fallback for a pet type not (yet) in its database — reused verbatim, including its "unknown" head texture, for any pet added after the source data was ported. */
const UNKNOWN_PET_DATA: PetDefinition = {
  head: UNKNOWN_HEAD,
  type: '???',
  maxTier: 'legendary',
  maxLevel: 100,
  emoji: '❓'
}

export interface RawPet {
  uuid?: string | null
  uniqueId?: string
  type: string
  exp: number
  active?: boolean
  tier: string
  heldItem?: string | null
  candyUsed?: number
  skin?: string | null
}

function titleCase(input: string): string {
  return input
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function headHashToUrl(headPath: string): string {
  // Same convention as getItemSkinUrls: a bare Mojang texture hash resolves
  // at textures.minecraft.net, not through SkyCrypt's own "/head/" proxy
  // (that route only exists on SkyCrypt's own server).
  const hash = headPath.replace(/^\/head\//, '')
  return `https://textures.minecraft.net/texture/${hash}`
}

/**
 * Ported from SkyCrypt's `getPetLevel` (src/stats/pets.js) — rewritten to
 * avoid its reliance on an out-of-bounds array read that happens to
 * resolve to `NaN` for an already-maxed pet (harmless there since that
 * value goes unused once "MAX LEVEL" is decided, but not a pattern worth
 * carrying over into a strictly-typed codebase). Produces identical
 * level/progress results for every non-maxed case.
 */
function getPetLevel(
  petExp: number,
  rarity: string,
  maxLevel: number
): { level: number; xpCurrent: number; xpForNext: number; progress: number; xpMaxLevel: number } {
  const rarityOffset = PET_RARITY_OFFSET[rarity] ?? 0
  const levels = PET_LEVELS.slice(rarityOffset, rarityOffset + maxLevel - 1)
  const xpMaxLevel = levels.reduce((a, b) => a + b, 0)

  let xpTotal = 0
  let level = 1
  for (let i = 0; i < levels.length; i++) {
    const next = xpTotal + levels[i]
    if (next > petExp) break
    xpTotal = next
    level++
  }

  if (level >= maxLevel) {
    return { level: maxLevel, xpCurrent: petExp - xpMaxLevel, xpForNext: 0, progress: 1, xpMaxLevel }
  }

  const xpCurrent = Math.floor(petExp - xpTotal)
  const xpForNext = Math.ceil(levels[level - 1])
  const progress = Math.max(0, Math.min(xpForNext > 0 ? xpCurrent / xpForNext : 1, 1))
  return { level, xpCurrent, xpForNext, progress, xpMaxLevel }
}

/** A Tier Boost held item bumps the displayed rarity by one, capped at the pet's own max tier — unless the pet type is flagged to ignore it (a few pets, e.g. Griffin, always show their raw tier). */
function resolvePetRarity(rawTier: string, heldItem: string | null | undefined, def: PetDefinition): PetRarity {
  const base = rawTier.toLowerCase() as PetRarity
  if (heldItem !== 'PET_ITEM_TIER_BOOST' || def.ignoresTierBoost) return base

  const maxIndex = PET_RARITIES.indexOf(def.maxTier as PetRarity)
  const bumpedIndex = Math.min(maxIndex === -1 ? PET_RARITIES.length - 1 : maxIndex, PET_RARITIES.indexOf(base) + 1)
  return PET_RARITIES[bumpedIndex]
}

function resolvePetName(type: string, rarity: PetRarity, def: PetDefinition, level: number): string {
  if (def.hatching && def.hatching.level > level) return def.hatching.name
  if (def.name) {
    if (typeof def.name === 'string') return def.name
    return def.name[rarity] ?? def.name.default ?? titleCase(type)
  }
  return titleCase(type)
}

function resolveHeadTextureUrl(rarity: PetRarity, def: PetDefinition, level: number): string | null {
  let headPath = typeof def.head === 'string' ? def.head : (def.head[rarity] ?? def.head.default)

  if (def.hatching && def.hatching.level > level) headPath = def.hatching.head
  if (def.upgrades?.[rarity]?.head) headPath = def.upgrades[rarity].head as string

  return headPath ? headHashToUrl(headPath) : null
}

function normalizePet(raw: RawPet): Pet {
  const def = PET_DATA[raw.type] ?? UNKNOWN_PET_DATA
  const rarity = resolvePetRarity(raw.tier, raw.heldItem, def)
  const level = getPetLevel(raw.exp, def.customLevelExpRarityOffset ?? rarity, def.maxLevel)
  const name = resolvePetName(raw.type, rarity, def, level.level)

  return {
    uuid: raw.uniqueId ?? raw.uuid ?? `${raw.type}-${raw.tier}-${Math.random()}`,
    type: raw.type,
    displayName: name,
    rarity,
    level: level.level,
    maxLevel: def.maxLevel,
    xpCurrent: level.xpCurrent,
    xpForNext: level.xpForNext,
    progress: level.progress,
    totalXp: raw.exp,
    active: raw.active ?? false,
    heldItem: raw.heldItem ?? null,
    candyUsed: raw.candyUsed ?? 0,
    headTextureUrl: resolveHeadTextureUrl(rarity, def, level.level),
    skillType: def.type,
    category: def.category ?? 'Pet',
    passivePerks: def.passivePerks ?? false
  }
}

/**
 * Sort order ported from SkyCrypt: active pet first, then by rarity
 * (highest first), then — within the same type — by level (highest
 * first); across different types of the same rarity, whichever type's
 * best individual pet is higher-level sorts first, tying back to that
 * type's own name alphabetically.
 */
function sortPets(pets: Pet[]): Pet[] {
  const bestLevelByTypeRarity = new Map<string, number>()
  for (const pet of pets) {
    const key = `${pet.type}:${pet.rarity}`
    const current = bestLevelByTypeRarity.get(key) ?? 0
    if (pet.level > current) bestLevelByTypeRarity.set(key, pet.level)
  }

  return [...pets].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1

    if (a.rarity !== b.rarity) return PET_RARITIES.indexOf(a.rarity) > PET_RARITIES.indexOf(b.rarity) ? -1 : 1

    if (a.type === b.type) return a.level > b.level ? -1 : 1

    const bestA = bestLevelByTypeRarity.get(`${a.type}:${a.rarity}`) ?? 0
    const bestB = bestLevelByTypeRarity.get(`${b.type}:${b.rarity}`) ?? 0
    if (bestA !== bestB) return bestA > bestB ? -1 : 1
    return a.type < b.type ? -1 : 1
  })
}

/**
 * A never-owned pet is rendered at its own max tier/level — the same
 * "best case" a missing pet would eventually reach — reusing the same
 * name/icon resolution an owned pet gets (so e.g. a missing Golden Dragon
 * correctly shows its real name, not the pre-hatch egg, since its
 * hatching threshold sits below its max level either way).
 */
function buildMissingPet(type: string, def: PetDefinition): MissingPet {
  const rarity = def.maxTier as PetRarity
  return {
    type,
    displayName: resolvePetName(type, rarity, def, def.maxLevel),
    rarity,
    headTextureUrl: resolveHeadTextureUrl(rarity, def, def.maxLevel),
    category: def.category ?? 'Pet'
  }
}

/**
 * Ported from SkyCrypt's `getMissingPets` — groups pet types that share a
 * `typeGroup` (the four Wisp variants) so owning any one of them counts as
 * owning the family, then represents an unowned family by whichever
 * sibling has the highest max tier (the one actually worth chasing).
 * Bingo-exclusive pets are excluded outside Bingo profiles, matching the
 * source.
 */
function computeMissingPets(ownedPets: Pet[], gameMode: string | undefined): MissingPet[] {
  const ownedGroups = new Set(ownedPets.map((p) => PET_DATA[p.type]?.typeGroup ?? p.type))

  const groups = new Map<string, { type: string; def: PetDefinition }[]>()
  for (const [type, def] of Object.entries(PET_DATA)) {
    if (def.bingoExclusive && gameMode !== 'bingo') continue
    const group = def.typeGroup ?? type
    if (ownedGroups.has(group)) continue

    const list = groups.get(group) ?? []
    list.push({ type, def })
    groups.set(group, list)
  }

  const missing: MissingPet[] = []
  for (const list of groups.values()) {
    const best = list.sort(
      (a, b) => PET_RARITIES.indexOf(b.def.maxTier as PetRarity) - PET_RARITIES.indexOf(a.def.maxTier as PetRarity)
    )[0]
    missing.push(buildMissingPet(best.type, best.def))
  }

  return missing.sort((a, b) => {
    if (a.rarity !== b.rarity) return PET_RARITIES.indexOf(a.rarity) > PET_RARITIES.indexOf(b.rarity) ? -1 : 1
    return a.displayName < b.displayName ? -1 : 1
  })
}

/**
 * Ported from SkyCrypt's `getPetScore` — https://hypixelskyblock.minecraft.wiki/w/Pet_Score,
 * cross-checked against a real profile's live score (a reported 209
 * total lands between the 175 and 225 thresholds, correctly giving +7
 * Magic Find, matching what the profile shows in-game). Each pet *type* contributes
 * its single highest-rarity copy's value, plus +1 if any copy of that
 * type is at max level — duplicates and non-maxed copies add nothing
 * further.
 */
function getPetScore(pets: Pet[]): { total: number; magicFind: number } {
  const bestRarityValue: Record<string, number> = {}
  const maxedTypes = new Set<string>()

  for (const pet of pets) {
    if (PET_DATA[pet.type]?.ignoredInPetScoreCalculation) continue

    const value = PET_VALUE[pet.rarity] ?? 0
    if (!(pet.type in bestRarityValue) || value > bestRarityValue[pet.type]) {
      bestRarityValue[pet.type] = value
    }
    if (pet.level >= pet.maxLevel) maxedTypes.add(pet.type)
  }

  const total = Object.values(bestRarityValue).reduce((a, b) => a + b, 0) + maxedTypes.size

  let magicFind = 0
  for (const [threshold, mf] of PET_REWARDS) {
    if (total >= threshold) magicFind = mf
  }

  return { total, magicFind }
}

export function computePets(profile: RawHypixelProfile, member: RawHypixelMember): PetsSummary {
  const rawPets = member.pets_data?.pets as RawPet[] | undefined
  if (rawPets === undefined) {
    return {
      apiEnabled: false,
      pets: [],
      ownedTypeCount: 0,
      totalTypeCount: 0,
      totalXp: 0,
      missing: [],
      petScore: 0,
      petScoreMagicFind: 0,
      totalCandyUsed: 0
    }
  }

  const pets = sortPets(rawPets.filter((p) => 'tier' in p).map(normalizePet))
  const { total: petScore, magicFind: petScoreMagicFind } = getPetScore(pets)
  const missing = computeMissingPets(pets, profile.game_mode)
  // typeGroup-deduped, same grouping computeMissingPets uses, so this
  // count plus missing.length always adds up to the full catalog size
  // rather than risking two different dedup rules drifting apart.
  const ownedTypeCount = new Set(pets.map((p) => PET_DATA[p.type]?.typeGroup ?? p.type)).size

  return {
    apiEnabled: true,
    pets,
    ownedTypeCount,
    totalTypeCount: ownedTypeCount + missing.length,
    totalXp: pets.reduce((sum, p) => sum + p.totalXp, 0),
    missing,
    petScore,
    petScoreMagicFind,
    totalCandyUsed: pets.reduce((sum, p) => sum + p.candyUsed, 0)
  }
}
