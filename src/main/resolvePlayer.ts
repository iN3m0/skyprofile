import type { Player } from '@shared/types/player'

export class PlayerNotFoundError extends Error {
  constructor(usernameOrUuid: string) {
    super(`No Minecraft player found for "${usernameOrUuid}"`)
    this.name = 'PlayerNotFoundError'
  }
}

const UUID_RE = /^[0-9a-fA-F]{8}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{4}-?[0-9a-fA-F]{12}$/

function dashUuid(raw: string): string {
  const hex = raw.replace(/-/g, '')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

async function usernameToUuidViaMojang(username: string): Promise<Player | null> {
  const response = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`)
  if (response.status === 404) return null
  if (!response.ok) return null
  const body = (await response.json()) as { id: string; name: string }
  return { uuid: dashUuid(body.id), username: body.name }
}

async function usernameToUuidViaPlayerDb(username: string): Promise<Player | null> {
  const response = await fetch(`https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`)
  if (!response.ok) return null
  const body = (await response.json()) as {
    success: boolean
    data?: { player?: { id: string; username: string } }
  }
  if (!body.success || !body.data?.player) return null
  return { uuid: dashUuid(body.data.player.id), username: body.data.player.username }
}

async function uuidToUsername(uuid: string): Promise<Player> {
  const dashed = dashUuid(uuid)
  const response = await fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${dashed.replace(/-/g, '')}`)
  if (!response.ok) {
    // Fall back to just the UUID with no display name rather than failing
    // the whole lookup — the Hypixel calls that follow only need the UUID.
    return { uuid: dashed, username: dashed }
  }
  const body = (await response.json()) as { id: string; name: string }
  return { uuid: dashed, username: body.name }
}

/**
 * Resolves a username or UUID (any dash format) to a canonical
 * `{ uuid, username }` pair. Username lookups try Mojang first, falling
 * back to playerdb.co if Mojang errors or rate-limits — isolated here so
 * swapping/adding providers later is a one-file change.
 */
export async function resolvePlayer(usernameOrUuid: string): Promise<Player> {
  const input = usernameOrUuid.trim()
  if (!input) throw new PlayerNotFoundError(usernameOrUuid)

  if (UUID_RE.test(input)) {
    return uuidToUsername(input)
  }

  try {
    const viaMojang = await usernameToUuidViaMojang(input)
    if (viaMojang) return viaMojang
  } catch {
    // network error — fall through to the playerdb.co fallback
  }

  const viaPlayerDb = await usernameToUuidViaPlayerDb(input)
  if (viaPlayerDb) return viaPlayerDb

  throw new PlayerNotFoundError(input)
}
