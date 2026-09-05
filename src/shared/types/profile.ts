export interface SkyblockProfileSummary {
  profileId: string
  cuteName: string
  gameMode: string | null
  selected: boolean
}

/**
 * Full profile payload for a single Skyblock profile. `members` is kept as
 * raw, unprocessed Hypixel JSON (keyed by member UUID) for now — decoding
 * it into normalized skills/collections/inventory/pets is M3-M5's job.
 * This raw shape still gets displayed (JSON-dumped) starting in M2 so the
 * data pipeline is verifiable end-to-end before the normalizer exists.
 */
export interface RawSkyblockProfile {
  profileId: string
  cuteName: string
  gameMode: string | null
  members: Record<string, unknown>
  banking: { balance: number } | null
}
