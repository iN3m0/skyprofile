import { ProfileNetworthCalculator } from 'skyhelper-networth'
import type { NetworthInfo, PlayerOverviewSummary, SkyblockLevelInfo } from '@shared/types/overview'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
import { normalizeUuid } from '../hypixel/profileService'
import { hypixelGet } from '../hypixel/client'
import { HypixelPaths } from '../hypixel/endpoints'
import { getRawMuseum } from '../museum/museumService'

interface RawPlayerResponse {
  success: boolean
  player: { firstLogin?: number; lastLogin?: number; lastLogout?: number } | null
}

/** SkyBlock Level costs a flat 100 XP per level — no cumulative table needed, unlike skills/dungeons/slayer. */
function getSkyblockLevel(xp: number): SkyblockLevelInfo {
  const level = Math.floor(xp / 100)
  const xpIntoLevel = xp % 100
  return {
    level,
    xp,
    xpForNextLevel: 100 - xpIntoLevel,
    progress: xpIntoLevel / 100
  }
}

async function computeNetworth(
  profile: RawHypixelProfile,
  member: RawHypixelMember,
  profileId: string,
  uuid: string
): Promise<NetworthInfo | null> {
  try {
    let museumMember: object | undefined
    try {
      const rawMuseum = await getRawMuseum(profileId)
      const target = normalizeUuid(uuid)
      museumMember = Object.entries(rawMuseum.members ?? {}).find(([key]) => normalizeUuid(key) === target)?.[1]
    } catch {
      // Museum fetch failing shouldn't block a networth estimate — the
      // calculator works fine without it, just slightly less complete.
      museumMember = undefined
    }

    const calculator = new ProfileNetworthCalculator(member, museumMember, profile.banking?.balance ?? 0)
    const result = await calculator.getNetworth()

    const categories = Object.entries(result.types)
      .map(([key, value]) => ({ key, total: (value as { total: number }).total }))
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total)

    return {
      total: result.networth,
      unsoulboundTotal: result.unsoulboundNetworth,
      purse: result.purse,
      bank: result.bank,
      personalBank: result.personalBank,
      categories
    }
  } catch {
    return null
  }
}

async function getPlayerLoginMeta(uuid: string): Promise<{ firstJoined: number | null; lastSeen: number | null }> {
  try {
    const data = await hypixelGet<RawPlayerResponse>(HypixelPaths.player, { uuid })
    return {
      firstJoined: data.player?.firstLogin ?? null,
      lastSeen: data.player?.lastLogout ?? data.player?.lastLogin ?? null
    }
  } catch {
    return { firstJoined: null, lastSeen: null }
  }
}

export async function computeOverview(
  profile: RawHypixelProfile,
  member: RawHypixelMember,
  profileId: string,
  uuid: string
): Promise<PlayerOverviewSummary> {
  const levelXp = member.leveling?.experience
  const skyblockLevel = levelXp !== undefined ? getSkyblockLevel(levelXp) : null

  const [networth, loginMeta] = await Promise.all([
    computeNetworth(profile, member, profileId, uuid),
    getPlayerLoginMeta(uuid)
  ])

  return {
    skyblockLevel,
    networth,
    firstJoined: loginMeta.firstJoined,
    lastSeen: loginMeta.lastSeen,
    profileCreatedAt: profile.created_at ?? null
  }
}
