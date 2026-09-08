export type CalendarEventCategory = 'major' | 'minor'

export interface CalendarEventStatus {
  key: string
  name: string
  category: CalendarEventCategory
  /** Epoch ms — start of the currently-active window, or the next one if not active. */
  startsAt: number
  /** Epoch ms — end of that same window. Equals `startsAt` for instant events (Dark Auction, Bank Interest). */
  endsAt: number
}

export interface BingoGoal {
  id: string
  name: string
  lore: string
  /** Community-wide progress toward this goal, if it's a tiered/counted one. */
  progress: number | null
  tiers: number[] | null
}

export interface BingoInfo {
  id: number
  name: string
  start: number
  end: number
  modifier: string
  goals: BingoGoal[]
}

export interface MayorPerk {
  name: string
  description: string
}

export interface ElectionCandidate {
  name: string
  votes: number
  perks: MayorPerk[]
}

export interface MayorInfo {
  name: string
  /** Set only when Mayor Jerry is elected — the co-mayor sharing the term. */
  minister: { name: string; perk: MayorPerk | null } | null
  perks: MayorPerk[]
}

export interface OngoingElection {
  year: number | null
  candidates: ElectionCandidate[]
  /** Epoch ms the voting window closes, if Hypixel provided one. */
  endsAt: number | null
}

export interface CalendarSummary {
  /** Epoch ms at the time this was computed — the renderer ticks its own clock forward from here. */
  now: number
  events: CalendarEventStatus[]
  /** null if the live Bingo fetch failed — the rest of the calendar still works without it. */
  bingo: BingoInfo | null
  /** null if the currently-serving mayor couldn't be fetched (this endpoint is known to be flaky). */
  mayor: MayorInfo | null
  /** null if there's no election running right now, or it couldn't be fetched. */
  election: OngoingElection | null
}
