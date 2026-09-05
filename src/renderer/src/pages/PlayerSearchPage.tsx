import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Player } from '@shared/types/player'
import type { PlayerSelectionProps } from '../lib/playerSelection'
import SkillsTab from '../tabs/SkillsTab'
import CollectionsTab from '../tabs/CollectionsTab'
import InventoryTab from '../tabs/InventoryTab'
import AccessoriesTab from '../tabs/AccessoriesTab'
import PetsTab from '../tabs/PetsTab'
import BestiaryTab from '../tabs/BestiaryTab'
import MinionsTab from '../tabs/MinionsTab'
import AttributesTab from '../tabs/AttributesTab'
import MuseumTab from '../tabs/MuseumTab'
import SlayerTab from '../tabs/SlayerTab'
import DungeonsTab from '../tabs/DungeonsTab'
import PlayerOverviewStats from '../components/PlayerOverviewStats'
import { SkeletonRows } from '../components/Skeleton'
import SketchButton from '../components/sketch/SketchButton'
import SketchBox from '../components/sketch/SketchBox'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './PlayerSearchPage.module.css'

function avatarUrl(uuid: string, size = 64): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`
}

/**
 * The full stats tracker (search → profiles → tabbed overview). Driven
 * entirely by `selection`/`setSelection` (lifted to App) rather than its
 * own local state, so it and any sidebar tool that also needs a player —
 * MP Calculator, the Stats Viewer tool shortcut — always agree on which
 * player/profile is "loaded" and never make each other re-search.
 */
export default function PlayerSearchPage({
  selection,
  setSelection
}: PlayerSelectionProps): React.JSX.Element {
  const [input, setInput] = useState('')

  const resolveMutation = useMutation({
    mutationFn: (usernameOrUuid: string) => api.player.resolve(usernameOrUuid),
    onSuccess: (player) => setSelection({ player, profileId: null, cuteName: null })
  })

  if (!selection.player || resolveMutation.isPending) {
    return (
      <div className={s.searchPage}>
        <h1 className={s.searchTitle}>Find a player</h1>
        <p className={s.searchSubtitle}>Enter a Minecraft username or UUID —</p>
        <form
          className={s.searchForm}
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
            className={`ruled-input font-hand ${s.searchInput}`}
          />
          <SketchButton
            type="submit"
            variant="primary"
            disabled={!input.trim() || resolveMutation.isPending}
          >
            {resolveMutation.isPending ? 'Searching…' : 'Search →'}
          </SketchButton>
        </form>
        {resolveMutation.isError && (
          <p className={s.errorText}>
            {resolveMutation.error instanceof Error
              ? resolveMutation.error.message
              : 'Something went wrong.'}
          </p>
        )}
      </div>
    )
  }

  if (!selection.profileId || !selection.cuteName) {
    const player = selection.player
    return (
      <ProfilesList
        player={player}
        onBack={() => setSelection({ player: null, profileId: null, cuteName: null })}
        onSelect={(profileId, cuteName) => setSelection({ player, profileId, cuteName })}
      />
    )
  }

  return (
    <ProfileOverview
      player={selection.player}
      profileId={selection.profileId}
      cuteName={selection.cuteName}
      onBack={() => setSelection({ player: selection.player, profileId: null, cuteName: null })}
    />
  )
}

function ProfilesList({
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
    <div className={s.profilesPage}>
      <button type="button" onClick={onBack} className={`font-hand ${s.backLink}`}>
        ↩ new search
      </button>

      <div className={s.identityRow}>
        <img src={avatarUrl(player.uuid, 48)} alt="" className={s.avatarSmall} />
        <h1 className={s.username}>{player.username}</h1>
      </div>

      {profilesQuery.isLoading && <SkeletonRows count={3} />}
      {profilesQuery.isError && (
        <p className={s.errorText}>
          {profilesQuery.error instanceof Error
            ? profilesQuery.error.message
            : 'Failed to load profiles.'}
        </p>
      )}
      {profilesQuery.data?.length === 0 && (
        <p className={s.mutedText}>This player has no Skyblock profiles.</p>
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
              <span className={s.profileMeta}>
                {profile.gameMode && profile.gameMode !== 'island' && (
                  <span className={`font-hand ${s.gameMode}`}>{profile.gameMode}</span>
                )}
                {profile.selected && <span className={`font-hand ${s.selected}`}>★ selected</span>}
              </span>
            </button>
          </SketchBox>
        ))}
      </div>
    </div>
  )
}

type OverviewTab =
  | 'skills'
  | 'collections'
  | 'inventory'
  | 'accessories'
  | 'pets'
  | 'bestiary'
  | 'minions'
  | 'attributes'
  | 'museum'
  | 'slayer'
  | 'dungeons'
  | 'raw'

function ProfileOverview({
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
  const [tab, setTab] = useState<OverviewTab>('skills')

  return (
    <div className={s.overviewPage}>
      <button type="button" onClick={onBack} className={`font-hand ${s.backLink}`}>
        ↩ profiles
      </button>

      <div className={s.overviewIdentity}>
        <img src={avatarUrl(player.uuid, 56)} alt="" className={s.avatarLarge} />
        <div>
          <h1 className={s.username}>{player.username}</h1>
          <p className={`font-hand ${s.mutedText}`}>
            on <span style={{ color: 'var(--color-text)' }}>{cuteName}</span>
          </p>
          <PlayerOverviewStats profileId={profileId} uuid={player.uuid} />
        </div>
      </div>

      <div className={s.tabRow}>
        {(
          [
            ['skills', 'var(--color-accent)'],
            ['collections', '#8bc34a'],
            ['inventory', '#e07fc0'],
            ['accessories', '#e8a33d'],
            ['pets', '#7fbfe0'],
            ['bestiary', '#a9714b'],
            ['minions', '#8bc34a'],
            ['attributes', '#a56de2'],
            ['museum', '#c9a15a'],
            ['slayer', '#e05a5a'],
            ['dungeons', '#7c6ce0'],
            ['raw', 'var(--color-progress)']
          ] as const
        ).map(([t, color]) => (
          <SketchButton
            key={t}
            color={tab === t ? color : undefined}
            onClick={() => setTab(t)}
            className={s.tabButton}
          >
            {t}
          </SketchButton>
        ))}
      </div>

      <div className={s.tabContent}>
        {tab === 'skills' && <SkillsTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'collections' && <CollectionsTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'inventory' && <InventoryTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'accessories' && <AccessoriesTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'pets' && <PetsTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'bestiary' && <BestiaryTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'minions' && <MinionsTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'attributes' && <AttributesTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'museum' && <MuseumTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'slayer' && <SlayerTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'dungeons' && <DungeonsTab profileId={profileId} uuid={player.uuid} />}
        {tab === 'raw' && <RawProfileView profileId={profileId} />}
      </div>
    </div>
  )
}

function RawProfileView({ profileId }: { profileId: string }): React.JSX.Element {
  const profileQuery = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => api.profile.get(profileId)
  })

  if (profileQuery.isLoading) return <SkeletonRows count={6} />
  if (profileQuery.isError) {
    return (
      <p className={s.errorText}>
        {profileQuery.error instanceof Error
          ? profileQuery.error.message
          : 'Failed to load profile.'}
      </p>
    )
  }
  return (
    <pre className={`font-tabular ${s.rawDump}`}>{JSON.stringify(profileQuery.data, null, 2)}</pre>
  )
}
