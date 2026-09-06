import { hypixelGet } from './client'
import { HypixelPaths } from './endpoints'
import { getOrFetch } from '../cache/cacheStore'

interface RawPlayerResponse {
  success: boolean
  player: {
    achievements?: Record<string, number>
  } | null
}

const ACHIEVEMENTS_CACHE_TTL_MS = 60_000

/**
 * A player's one-off Hypixel achievement point values (not per-profile —
 * this is the `/player` endpoint, separate from `/skyblock/profile`).
 * Currently only used for `skyblock_domesticator`, which stores the
 * player's current Taming skill level cap directly (see skills/constants.ts).
 */
export async function getPlayerAchievements(uuid: string): Promise<Record<string, number>> {
  return getOrFetch(`achievements:${uuid}`, ACHIEVEMENTS_CACHE_TTL_MS, async () => {
    const data = await hypixelGet<RawPlayerResponse>(HypixelPaths.player, { uuid })
    return data.player?.achievements ?? {}
  })
}
