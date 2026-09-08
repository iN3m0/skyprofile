import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { BingoInfo, CalendarEventStatus, MayorInfo, OngoingElection } from '@shared/types/calendar'
import { SkeletonRows } from '../components/Skeleton'
import SketchBox from '../components/sketch/SketchBox'
import SketchProgress from '../components/sketch/SketchProgress'
import { formatPrice } from '../lib/formatPrice'
import s from './CalendarTool.module.css'

const MAJOR_COLOR = 'var(--color-accent)'
const MINOR_COLOR = '#7fbfe0'

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

/**
 * Every event's timing is computed formula-driven from a fixed real-world
 * anchor (see src/main/calendar/data/README.md) — no per-player data, so
 * this tool needs no player/profile selection at all, unlike the others.
 * The live-ticking countdown is purely a client-side clock against the
 * already-fetched startsAt/endsAt; the query itself just re-polls
 * periodically to roll over to each event's next occurrence and refresh
 * Bingo's live progress.
 */
export default function CalendarTool(): React.JSX.Element {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const query = useQuery({
    queryKey: ['calendar'],
    queryFn: () => api.resources.getCalendar(),
    refetchInterval: 60_000
  })

  return (
    <div className={s.page}>
      <h1 className={`font-hand ${s.title}`}>Calendar</h1>
      <p className={s.subtitle}>Every recurring SkyBlock event, computed live. No search needed.</p>

      {query.isLoading && <SkeletonRows count={6} />}
      {query.isError && (
        <p className={s.errorText}>
          {query.error instanceof Error ? query.error.message : 'Failed to load calendar data.'}
        </p>
      )}

      {query.data && (
        <>
          <EventList events={query.data.events} now={now} />
          <MayorPanel mayor={query.data.mayor} election={query.data.election} now={now} />
          <BingoPanel bingo={query.data.bingo} />

          <div className={s.gapSection}>
            <h3 className={`font-hand ${s.gapTitle}`}>Not shown</h3>
            <div className={s.gapList}>
              <div className={s.gapRow}>
                <span className={`font-hand ${s.gapName}`}>Year of the ___</span>
                <span className={`font-hand ${s.gapReason}`}>
                  A real 12-SkyBlock-year rotating theme, but only 3 of the 12 have been revealed
                  so far (Pig, Seal, Witch) — no published table maps a year to its theme yet.
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function EventList({ events, now }: { events: CalendarEventStatus[]; now: number }): React.JSX.Element {
  const withStatus = events.map((event) => ({
    event,
    isActive: now >= event.startsAt && now < event.endsAt,
    isInstant: event.endsAt === event.startsAt
  }))
  const sorted = [...withStatus].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1
    return a.event.startsAt - b.event.startsAt
  })

  return (
    <div className={s.list}>
      {sorted.map(({ event, isActive, isInstant }) => {
        const color = event.category === 'major' ? MAJOR_COLOR : MINOR_COLOR
        return (
          <SketchBox key={event.key} className={s.eventCard} stroke={isActive ? color : 'var(--color-ink)'}>
            <div className={s.eventRow}>
              <span className={`font-hand ${s.eventName}`} style={{ color }}>
                {event.name}
              </span>
              {isActive ? (
                <span className={`font-tabular ${s.eventLive}`} style={{ color }}>
                  LIVE — ends in {formatDuration(event.endsAt - now)}
                </span>
              ) : (
                <span className={`font-tabular ${s.eventMeta}`}>
                  {isInstant ? 'Next' : 'Starts'} in {formatDuration(event.startsAt - now)}
                  {' · '}
                  {formatDate(event.startsAt)}
                </span>
              )}
            </div>
          </SketchBox>
        )
      })}
    </div>
  )
}

/**
 * The mayor/election endpoint is real but flaky — it sometimes just hangs
 * with no response (see src/main/hypixel/endpoints.ts), so `mayor`/
 * `election` are frequently null for reasons unrelated to game state.
 * Shown as "unavailable right now" rather than omitted, so it doesn't read
 * as a permanent gap the way the Year-of-the-___ note does.
 */
function MayorPanel({
  mayor,
  election,
  now
}: {
  mayor: MayorInfo | null
  election: OngoingElection | null
  now: number
}): React.JSX.Element {
  return (
    <div className={s.mayorSection}>
      <h2 className={`font-hand ${s.bingoTitle}`}>Mayor</h2>
      {mayor ? (
        <>
          <p className="font-hand" style={{ color: MAJOR_COLOR, fontSize: 15 }}>
            {mayor.name}
            {mayor.minister && ` & ${mayor.minister.name}`}
          </p>
          {mayor.perks.length > 0 && (
            <ul className={s.perkList}>
              {mayor.perks.map((perk) => (
                <li key={perk.name} className={s.perkRow}>
                  <span className="font-hand">{perk.name}</span>
                  {perk.description && (
                    <span className={`font-hand ${s.perkDescription}`}>{perk.description}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <p className={`font-hand ${s.mutedText}`}>Unavailable right now — try refreshing later.</p>
      )}

      {election && election.candidates.length > 0 && (
        <div className={s.electionBlock}>
          <p className={`font-hand ${s.mutedText}`}>
            Election in progress
            {election.endsAt !== null && ` · voting ends in ${formatDuration(election.endsAt - now)}`}
          </p>
          <div className={s.candidateList}>
            {[...election.candidates]
              .sort((a, b) => b.votes - a.votes)
              .map((candidate) => (
                <div key={candidate.name} className={s.candidateRow}>
                  <span className="font-hand">{candidate.name}</span>
                  <span className={`font-tabular ${s.candidateVotes}`}>
                    {formatPrice(candidate.votes)} votes
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BingoPanel({ bingo }: { bingo: BingoInfo | null }): React.JSX.Element | null {
  if (!bingo) return null

  return (
    <div className={s.bingoSection}>
      <h2 className={`font-hand ${s.bingoTitle}`}>{bingo.name} Bingo</h2>
      <p className={`font-hand ${s.mutedText}`}>
        {formatDate(bingo.start)} – {formatDate(bingo.end)} · community goal progress, live
      </p>
      <div className={s.bingoGoals}>
        {bingo.goals.map((goal) => {
          const maxTier = goal.tiers && goal.tiers.length > 0 ? goal.tiers[goal.tiers.length - 1] : null
          const progress = maxTier && goal.progress !== null ? Math.min(goal.progress / maxTier, 1) : null
          return (
            <div key={goal.id} className={s.bingoGoalRow}>
              <div className={s.bingoGoalHeader}>
                <span className="font-hand">{goal.name}</span>
                {maxTier !== null && goal.progress !== null && (
                  <span className={`font-tabular ${s.bingoGoalMeta}`}>
                    {formatPrice(goal.progress)}/{formatPrice(maxTier)}
                  </span>
                )}
              </div>
              {progress !== null && <SketchProgress progress={progress} height={10} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
