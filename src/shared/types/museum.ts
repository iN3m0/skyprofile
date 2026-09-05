import type { Rarity } from './item'

export interface MuseumItem {
  itemId: string
  name: string
  rarity: Rarity | null
  headTextureUrl: string | null
  donated: boolean
  /** Raw §-coded display name and lore straight off the donated item's own NBT — null for an undonated item, since there's no instance to read a tag off of. */
  displayName: string | null
  lore: string[] | null
}

export interface MuseumCategory {
  key: string
  name: string
  items: MuseumItem[]
  donatedCount: number
  totalCount: number
}

export interface MuseumSummary {
  /** false when this profile has no museum data available (e.g. the API call itself failed). */
  apiEnabled: boolean
  /** Hypixel's own raw museum coin value for this member. */
  value: number
  categories: MuseumCategory[]
  donatedCount: number
  totalCatalogued: number
}
