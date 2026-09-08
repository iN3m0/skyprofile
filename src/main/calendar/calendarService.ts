import type {
  BingoGoal,
  BingoInfo,
  CalendarEventStatus,
  CalendarSummary,
  ElectionCandidate,
  MayorInfo,
  MayorPerk,
  OngoingElection
} from '@shared/types/calendar'
import { hypixelGetPublic } from '../hypixel/client'
import { HypixelPaths } from '../hypixel/endpoints'
import { getOrFetch } from '../cache/cacheStore'
import eventsData from './data/events.json'

interface EventDef {
  key: string
  name: string
  category: 'major' | 'minor'
  anchorMs: number
  intervalMs: number
  durationMs: number
}

const EVENTS = eventsData as EventDef[]

/**
 * Every event here is periodic from a fixed real-world anchor — no SkyBlock
 * day/season calendar math needed. See `data/README.md` for where the
 * anchors came from and how they were verified.
 */
function computeEventStatus(def: EventDef, now: number): CalendarEventStatus {
  const sinceAnchor = now - def.anchorMs
  const occurrencesPassed = Math.floor(sinceAnchor / def.intervalMs)
  const phase = sinceAnchor - occurrencesPassed * def.intervalMs
  const currentStart = def.anchorMs + occurrencesPassed * def.intervalMs
  const isActive = phase < def.durationMs

  const startsAt = isActive ? currentStart : currentStart + def.intervalMs
  const endsAt = startsAt + def.durationMs

  return { key: def.key, name: def.name, category: def.category, startsAt, endsAt }
}

interface RawBingoGoal {
  id: string
  name: string
  lore?: string
  fullLore?: string[]
  tiers?: number[]
  progress?: number
}

interface RawBingoResponse {
  success: boolean
  id: number
  name: string
  start: number
  end: number
  modifier: string
  goals: RawBingoGoal[]
}

const BINGO_CACHE_TTL_MS = 5 * 60_000

async function getBingo(): Promise<BingoInfo | null> {
  try {
    return await getOrFetch('calendar:bingo', BINGO_CACHE_TTL_MS, async () => {
      const data = await hypixelGetPublic<RawBingoResponse>(HypixelPaths.resourceBingo)
      const goals: BingoGoal[] = data.goals.map((g) => ({
        id: g.id,
        name: g.name,
        lore: g.fullLore?.join(' ') ?? g.lore ?? '',
        progress: g.progress ?? null,
        tiers: g.tiers ?? null
      }))
      return {
        id: data.id,
        name: data.name,
        start: data.start,
        end: data.end,
        modifier: data.modifier,
        goals
      }
    })
    // Bingo is supplementary — if the live fetch fails, the rest of the
    // calendar (all formula-driven, no network needed) still works fine.
  } catch {
    return null
  }
}

interface RawPerk {
  name?: string
  description?: string
}

interface RawCandidate {
  name?: string
  key?: string
  votes?: number
  perks?: RawPerk[]
}

interface RawMayor {
  name?: string
  key?: string
  perks?: RawPerk[]
  minister?: { name?: string; perk?: RawPerk }
}

interface RawElectionResponse {
  success: boolean
  mayor?: RawMayor | null
  current?: {
    candidates?: RawCandidate[]
    year?: number
    end?: number
    endTime?: number
    endTimeMillis?: number
  } | null
}

function parsePerk(raw: RawPerk | undefined): MayorPerk | null {
  if (!raw?.name) return null
  return { name: raw.name, description: raw.description ?? '' }
}

function parsePerks(raw: RawPerk[] | undefined): MayorPerk[] {
  if (!Array.isArray(raw)) return []
  return raw.map(parsePerk).filter((p): p is MayorPerk => p !== null)
}

function parseCandidate(raw: RawCandidate): ElectionCandidate {
  return {
    name: raw.name ?? raw.key ?? 'Unknown',
    votes: raw.votes ?? 0,
    perks: parsePerks(raw.perks)
  }
}

const ELECTION_CACHE_TTL_MS = 5 * 60_000

/**
 * A real, confirmed endpoint (see endpoints.ts), but flaky — often hangs
 * with no response at all. Mayor and the ongoing election both come from
 * this one call, so they share a single cache entry/fetch/failure.
 */
async function getMayorAndElection(): Promise<{ mayor: MayorInfo | null; election: OngoingElection | null }> {
  try {
    return await getOrFetch('calendar:election', ELECTION_CACHE_TTL_MS, async () => {
      const data = await hypixelGetPublic<RawElectionResponse>(HypixelPaths.resourceElection)

      const mayor: MayorInfo | null = data.mayor?.name
        ? {
            name: data.mayor.name,
            minister: data.mayor.minister?.name
              ? { name: data.mayor.minister.name, perk: parsePerk(data.mayor.minister.perk) }
              : null,
            perks: parsePerks(data.mayor.perks)
          }
        : null

      const election: OngoingElection | null = data.current
        ? {
            year: data.current.year ?? null,
            candidates: (data.current.candidates ?? []).map(parseCandidate),
            endsAt: data.current.end ?? data.current.endTime ?? data.current.endTimeMillis ?? null
          }
        : null

      return { mayor, election }
    })
  } catch {
    return { mayor: null, election: null }
  }
}

export async function computeCalendar(): Promise<CalendarSummary> {
  const now = Date.now()
  const events = EVENTS.map((def) => computeEventStatus(def, now))
  // Run together — the election endpoint's occasional multi-second hang
  // (see endpoints.ts) shouldn't add to Bingo's otherwise-fast response.
  const [bingo, { mayor, election }] = await Promise.all([getBingo(), getMayorAndElection()])
  return { now, events, bingo, mayor, election }
}
