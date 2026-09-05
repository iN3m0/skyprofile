export interface CollectionEntry {
  id: string
  name: string
  amount: number
  tier: number
  maxTier: number
}

export interface CollectionCategory {
  key: string
  name: string
  entries: CollectionEntry[]
}

export interface CollectionsSummary {
  /** false when the player has Collections API access disabled for this profile. */
  apiEnabled: boolean
  categories: CollectionCategory[]
}
