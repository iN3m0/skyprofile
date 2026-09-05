import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Player } from '@shared/types/player'
import type { PlayerSelectionProps } from '../lib/playerSelection'
import { SkeletonRows } from '../components/Skeleton'
import MpCalculatorRow from '../components/MpCalculatorRow'
import SketchButton from '../components/sketch/SketchButton'
import SketchBox from '../components/sketch/SketchBox'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './MpCalculatorTool.module.css'

function avatarUrl(uuid: string, size = 40): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`
}

/**
 * A clone of the SkyHelper Discord bot's `/missing` command: given a player
 * + profile, ranks every way to spend coins on Magical Power — missing
 * accessories, available upgrades, the multi-rarity "custom price" items,
 * and Recombobulator 3000 suggestions — by coins spent per point of MP
 * gained, cheapest first. Renders `computeAccessories`'s `mpCalculator`
 * list directly, without the rest of the profile-overview tab chrome.
 *
 * Driven by `selection`/`setSelection` (lifted to App) rather than its own
 * local state, so switching here from the Stats Viewer (or vice versa)
 * keeps whichever player/profile was already loaded instead of asking
 * again.
 */
export default function MpCalculatorTool({
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
      <h1 className={`font-hand ${s.title}`}>MP Calculator</h1>
      <p className={s.subtitle}>
        Coins per Magical Power, cheapest first — like SkyHelper&apos;s /missing.
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
  const query = useQuery({
    queryKey: ['accessories', profileId, player.uuid],
    queryFn: () => api.member.getAccessories(profileId, player.uuid)
  })

  return (
    <div>
      <button type="button" onClick={onBack} className={`font-hand ${s.backLink}`}>
        ↩ profiles
      </button>

      <div className={s.identityRow}>
        <img src={avatarUrl(player.uuid, 40)} alt="" className={s.avatar} />
        <div>
          <h2 className={s.username}>{player.username}</h2>
          <p className={`font-hand ${s.mutedText}`}>on {cuteName}</p>
        </div>
      </div>

      {query.isLoading && <SkeletonRows count={6} />}
      {query.isError && (
        <p className={s.errorText}>
          {query.error instanceof Error ? query.error.message : 'Failed to load accessories.'}
        </p>
      )}
      {query.data && !query.data.apiEnabled && (
        <p className={`font-hand ${s.mutedText}`}>
          this player has inventory api access disabled — can&apos;t compute what they&apos;re
          missing.
        </p>
      )}

      {query.data?.apiEnabled && (
        <div>
          <p className={`font-hand ${s.mutedText}`} style={{ marginBottom: 12 }}>
            Ranked by coins spent per point of Magical Power gained — cheapest first.
          </p>
          {query.data.mpCalculator.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>
              Nothing left to chase — every accessory is owned, maxed, and recombobulated.
            </p>
          ) : (
            <div className={s.list}>
              {query.data.mpCalculator.map((entry, i) => (
                <MpCalculatorRow
                  key={entry.itemId ?? `recomb-${entry.rarity}-${i}`}
                  entry={entry}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
