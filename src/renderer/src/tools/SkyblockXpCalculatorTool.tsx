import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Player } from '@shared/types/player'
import type { PlayerSelectionProps } from '../lib/playerSelection'
import { SkeletonRows } from '../components/Skeleton'
import { getHplusIconUrl } from '../lib/itemTextures'
import { formatPrice } from '../lib/formatPrice'
import SketchButton from '../components/sketch/SketchButton'
import SketchBox from '../components/sketch/SketchBox'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './SkyblockXpCalculatorTool.module.css'

function avatarUrl(uuid: string, size = 40): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`
}

const SOURCE_COLORS: Record<string, string> = {
  museum: '#c9a15a',
  accessories: '#e8a33d',
  bank: '#dcac4c',
  minions: '#8bc34a',
  pets: '#7fbfe0',
  essence: '#e05a5a'
}

const SOURCE_LABELS: Record<string, string> = {
  museum: 'Museum',
  accessories: 'Accessories',
  bank: 'Bank',
  minions: 'Minions',
  pets: 'Pets',
  essence: 'Essence Shop'
}

/**
 * "Cheapest cost per SkyBlock XP": every coin-buyable SkyBlock XP source
 * this app has real cost data for, merged into one ranked list — Museum
 * donations, Magical Power (Accessory Bag Upgrades convert 1:1 to XP),
 * and Bank Upgrade tiers. See `src/main/xpcalculator/data/README.md` for
 * the full research trail on why several requested categories (minions,
 * essence shops, pets, abiphone contacts, attributes, fast travel) aren't
 * included — shown in this tool too, not just in that file, so the gap is
 * always visible rather than assumed-covered.
 */
export default function SkyblockXpCalculatorTool({
  selection,
  setSelection
}: PlayerSelectionProps): React.JSX.Element {
  const [input, setInput] = useState('')

  const resolveMutation = useMutation({
    mutationFn: (usernameOrUuid: string) => api.player.resolve(usernameOrUuid),
    onSuccess: (player) => setSelection({ player, profileId: null, cuteName: null })
  })

  return (
    <div className={s.page}>
      <h1 className={`font-hand ${s.title}`}>SkyBlock XP Calculator</h1>
      <p className={s.subtitle}>
        Cheapest coins per point of SkyBlock XP, across every source with a real price.
      </p>

      {!selection.player && (
        <>
          <form
            className={s.form}
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim()) resolveMutation.mutate(input.trim())
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Technoblade"
              autoFocus
              className={`ruled-input font-hand ${s.input}`}
            />
            <SketchButton
              type="submit"
              variant="primary"
              disabled={!input.trim() || resolveMutation.isPending}
            >
              {resolveMutation.isPending ? 'Searching…' : 'Go →'}
            </SketchButton>
          </form>
          {resolveMutation.isError && (
            <p className={s.errorText}>
              {resolveMutation.error instanceof Error
                ? resolveMutation.error.message
                : 'Something went wrong.'}
            </p>
          )}
        </>
      )}

      {selection.player && (!selection.profileId || !selection.cuteName) && (
        <ProfilePicker
          player={selection.player}
          onBack={() => setSelection({ player: null, profileId: null, cuteName: null })}
          onSelect={(profileId, cuteName) =>
            setSelection({ player: selection.player, profileId, cuteName })
          }
        />
      )}

      {selection.player && selection.profileId && selection.cuteName && (
        <Result
          player={selection.player}
          profileId={selection.profileId}
          cuteName={selection.cuteName}
          onBack={() => setSelection({ player: selection.player, profileId: null, cuteName: null })}
        />
      )}
    </div>
  )
}

function ProfilePicker({
  player,
  onBack,
  onSelect
}: {
  player: Player
  onBack: () => void
  onSelect: (profileId: string, cuteName: string) => void
}): React.JSX.Element {
  const profilesQuery = useQuery({
    queryKey: ['profiles', player.uuid],
    queryFn: () => api.player.getProfiles(player.uuid)
  })

  return (
    <div>
      <button type="button" onClick={onBack} className={`font-hand ${s.backLink}`}>
        ↩ new search
      </button>

      <div className={s.identityRow}>
        <img src={avatarUrl(player.uuid, 40)} alt="" className={s.avatar} />
        <h2 className={s.username}>{player.username}</h2>
      </div>

      {profilesQuery.isLoading && <SkeletonRows count={3} />}
      {profilesQuery.isError && (
        <p className={s.errorText}>
          {profilesQuery.error instanceof Error
            ? profilesQuery.error.message
            : 'Failed to load profiles.'}
        </p>
      )}

      <div className={s.profileList}>
        {profilesQuery.data?.map((profile, i) => (
          <SketchBox
            key={profile.profileId}
            rotate={i % 2 === 0 ? -0.4 : 0.4}
            className={s.profileCard}
            stroke={MARKER_COLORS[i % MARKER_COLORS.length]}
          >
            <button
              type="button"
              onClick={() => onSelect(profile.profileId, profile.cuteName)}
              className={s.profileCardButton}
            >
              <span
                className={`font-hand ${s.profileName}`}
                style={{ color: MARKER_COLORS[i % MARKER_COLORS.length] }}
              >
                {profile.cuteName}
              </span>
              {profile.selected && <span className={`font-hand ${s.selected}`}>★ selected</span>}
            </button>
          </SketchBox>
        ))}
      </div>
    </div>
  )
}

function Result({
  player,
  profileId,
  cuteName,
  onBack
}: {
  player: Player
  profileId: string
  cuteName: string
  onBack: () => void
}): React.JSX.Element {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const queryKey = ['skyblockXpCalculator', profileId, player.uuid]
  const query = useQuery({
    queryKey,
    queryFn: () => api.member.getSkyblockXpCalculator(profileId, player.uuid)
  })

  const refreshMutation = useMutation({
    mutationFn: () => api.member.getSkyblockXpCalculator(profileId, player.uuid, true),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  })

  const filtered = useMemo(() => {
    const entries = query.data?.entries ?? []
    const term = search.trim().toLowerCase()
    if (!term) return entries
    return entries.filter(
      (e) => e.name.toLowerCase().includes(term) || e.category?.toLowerCase().includes(term)
    )
  }, [query.data, search])

  return (
    <div>
      <button type="button" onClick={onBack} className={`font-hand ${s.backLink}`}>
        ↩ profiles
      </button>

      <div className={s.identityRow}>
        <img src={avatarUrl(player.uuid, 40)} alt="" className={s.avatar} />
        <div style={{ flex: 1 }}>
          <h2 className={s.username}>{player.username}</h2>
          <p className={`font-hand ${s.mutedText}`}>on {cuteName}</p>
        </div>
        <SketchButton onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
          {refreshMutation.isPending ? 'Refreshing…' : '↻ Refresh'}
        </SketchButton>
      </div>

      {query.isLoading && <SkeletonRows count={6} />}
      {query.isError && (
        <p className={s.errorText}>
          {query.error instanceof Error ? query.error.message : 'Failed to load data.'}
        </p>
      )}
      {query.data && !query.data.apiEnabled && (
        <p className={`font-hand ${s.mutedText}`}>
          this player has no accessory/museum data available for this profile.
        </p>
      )}

      {query.data?.apiEnabled && (
        <div>
          <div className={s.toolbar}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or category…"
              className={`ruled-input font-hand ${s.searchInput}`}
            />
          </div>
          <p className={`font-hand ${s.mutedText}`} style={{ marginBottom: 12 }}>
            {filtered.length} of {query.data.entries.length} priced entries — ranked by coins per
            point of SkyBlock XP, cheapest first.
          </p>

          {filtered.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>No entry matches "{search}".</p>
          ) : (
            <div className={s.list}>
              {filtered.map((entry, i) => {
                const iconUrl = entry.itemId ? getHplusIconUrl(entry.itemId) : null
                const color = SOURCE_COLORS[entry.source] ?? 'var(--color-text)'
                return (
                  <div key={`${entry.source}-${entry.name}-${i}`} className={s.row}>
                    {iconUrl ? (
                      <img src={iconUrl} alt="" className={s.icon} />
                    ) : (
                      <span className={s.placeholder} style={{ backgroundColor: color }} />
                    )}
                    <div className={s.body}>
                      <span className="font-hand" style={{ color }}>
                        {entry.name}
                      </span>
                      <p className={`font-tabular ${s.meta}`}>
                        {SOURCE_LABELS[entry.source] ?? entry.source}
                        {entry.category &&
                          entry.category !== SOURCE_LABELS[entry.source] &&
                          ` · ${entry.category}`}{' '}
                        · {entry.xp} XP{entry.source === 'accessories' ? ' (per MP)' : ''}
                      </p>
                    </div>
                    <div className={s.cost}>
                      <span
                        className={`font-tabular ${entry.costPerXp !== null ? s.costValue : s.noPrice}`}
                      >
                        {entry.costPerXp !== null
                          ? `${formatPrice(entry.costPerXp)}/XP`
                          : 'no price data'}
                      </span>
                      {entry.cost !== null && entry.source !== 'accessories' && (
                        <span className={`font-tabular ${s.totalCost}`}>
                          ({formatPrice(entry.cost)} total)
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {query.data.excludedSources.length > 0 && (
            <div className={s.excludedSection}>
              <h3 className={`font-hand ${s.excludedTitle}`}>Not included (yet)</h3>
              <p className={`font-hand ${s.mutedText}`}>
                These are real SkyBlock XP sources too, but this calculator doesn&apos;t have a real
                cost for them:
              </p>
              <div className={s.excludedList}>
                {query.data.excludedSources.map((excluded) => (
                  <div key={excluded.name} className={s.excludedRow}>
                    <span className={`font-hand ${s.excludedName}`}>{excluded.name}</span>
                    <span className={`font-hand ${s.excludedReason}`}>{excluded.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
