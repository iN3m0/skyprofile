import bestiaryData from './data/bestiary.json'

/**
 * NEU-REPO's bestiary.json shape (see data/README.md for provenance):
 * a top-level object keyed by category id, plus two special `brackets`/
 * `bracketSets` keys holding the shared tier-threshold tables every mob
 * family's `bracket` (and, for Critters, `bracketType`) index into.
 * A category is either flat (`mobs` directly) or has one further
 * subcategory layer (`hasSubcategories: true`, with each subcategory as a
 * sibling property alongside `name`/`icon`/`hasSubcategories`) — Critter
 * Safari is currently the only category using the latter.
 */
export interface RawMobIcon {
  skullOwner?: string
  texture?: string
}

export interface RawMobEntry {
  name: string
  skullOwner?: string
  texture?: string
  cap: number
  mobs: string[]
  bracket: number
  /** Present only for Critters (Safari) mobs — indexes bracketSets instead of the main brackets table. */
  bracketType?: string
}

export interface RawBestiarySubcategory {
  name: string
  icon?: RawMobIcon
  mobs: RawMobEntry[]
}

export interface RawBestiaryCategory {
  name: string
  icon?: RawMobIcon
  hasSubcategories?: boolean
  mobs?: RawMobEntry[]
  // Subcategories (when hasSubcategories is true) are additional sibling
  // properties here rather than a nested wrapper — accessed via a runtime
  // filter over Object.entries in bestiaryService.ts, not typed
  // individually, since their keys vary per category.
  [subcategoryKey: string]: unknown
}

interface RawBestiaryRoot {
  brackets: Record<string, number[]>
  bracketSets: Record<string, Record<string, number[]>>
  [categoryKey: string]: unknown
}

const root = bestiaryData as unknown as RawBestiaryRoot

export const BESTIARY_BRACKETS = root.brackets
export const BESTIARY_BRACKET_SETS = root.bracketSets

const NON_CATEGORY_KEYS = new Set(['brackets', 'bracketSets'])

export function getBestiaryCategories(): Record<string, RawBestiaryCategory> {
  const categories: Record<string, RawBestiaryCategory> = {}
  for (const [key, value] of Object.entries(root)) {
    if (NON_CATEGORY_KEYS.has(key)) continue
    categories[key] = value as RawBestiaryCategory
  }
  return categories
}

/** The shared tier-threshold array a mob family's `cap` and kill count are measured against. */
export function getBracketThresholds(mob: RawMobEntry): number[] {
  if (mob.bracketType) return BESTIARY_BRACKET_SETS[mob.bracketType]?.[mob.bracket] ?? []
  return BESTIARY_BRACKETS[mob.bracket] ?? []
}
