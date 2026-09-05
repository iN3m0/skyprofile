import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Player } from '@shared/types/player'
import type { PlayerSelectionProps } from '../lib/playerSelection'
import { SkeletonRows } from '../components/Skeleton'
import { getHplusIconUrl } from '../lib/itemTextures'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import SketchButton from '../components/sketch/SketchButton'
import SketchBox from '../components/sketch/SketchBox'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './MuseumCalculatorTool.module.css'

function avatarUrl(uuid: string, size = 40): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`
}

/**
 * "Cheapest items to donate per SkyBlock XP": ranks every Museum item the
 * selected player hasn't donated yet by coins spent per point of SkyBlock
 * XP the donation grants, pricing each at whichever's cheaper right now —
 * buying it off the AH/bazaar, or crafting it from sub-ingredients. See
 * `src/main/museum/data/README.md` for the XP-value and crafting-recipe
 * data sources. Driven by the shared `selection` (lifted to App) the same
 * way MP Calculator and Attribute Calculator are, so switching tools never
 * means re-searching.
 */
export default function MuseumCalculatorTool({
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
      <h1 className={`font-hand ${s.title}`}>Museum Calculator</h1>
      <p className={s.subtitle}>
        Cheapest items to donate per SkyBlock XP — craft cost or AH, whichever's less.
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
  const queryClient = useQueryClient()
  const queryKey = ['museumCalculator', profileId, player.uuid]
  const query = useQuery({
    queryKey,
    queryFn: () => api.member.getMuseumCalculator(profileId, player.uuid)
  })

  const refreshMutation = useMutation({
    mutationFn: () => api.member.getMuseumCalculator(profileId, player.uuid, true),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  })

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
          {query.error instanceof Error ? query.error.message : 'Failed to load museum data.'}
        </p>
      )}
      {query.data && !query.data.apiEnabled && (
        <p className={`font-hand ${s.mutedText}`}>
          this player has no museum data available for this profile.
        </p>
      )}

      {query.data?.apiEnabled && (
        <div>
          <p className={`font-hand ${s.mutedText}`} style={{ marginBottom: 12 }}>
            {query.data.entries.length} undonated items — ranked by coins per point of SkyBlock XP,
            cheapest first.
          </p>
          {query.data.entries.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>
              Every XP-granting Museum item is already donated.
            </p>
          ) : (
            <div className={s.list}>
              {query.data.entries.map((entry) => {
                const color = getRarityColor(entry.rarity?.toLowerCase() ?? null)
                const iconUrl = getHplusIconUrl(entry.itemId)
                return (
                  <div key={entry.itemId} className={s.row}>
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
                        {entry.category} · {entry.xp} XP
                        {entry.costSource &&
                          ` · cheapest by ${entry.costSource === 'buy' ? 'AH' : 'crafting'}`}
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
                      {entry.cost !== null && (
                        <span className={`font-tabular ${s.totalCost}`}>
                          ({formatPrice(entry.cost)})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
