import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Player } from '@shared/types/player'
import type { FusionIngredient } from '@shared/types/attributeFusion'
import type { PlayerSelectionProps } from '../lib/playerSelection'
import { SkeletonRows } from '../components/Skeleton'
import FusionRecipeRow from '../components/FusionRecipeRow'
import { getAttributeIconUrl } from '../lib/attributeIcons'
import { getHplusIconUrl } from '../lib/itemTextures'
import { getRarityColor } from '../lib/rarityColors'
import { formatPrice } from '../lib/formatPrice'
import SketchButton from '../components/sketch/SketchButton'
import SketchBox from '../components/sketch/SketchBox'
import { MARKER_COLORS } from '../lib/skillColors'
import s from './AttributeCalculatorTool.module.css'

const GENERIC_SHARD_ICON_URL = getHplusIconUrl('ATTRIBUTE_SHARD')

function avatarUrl(uuid: string, size = 40): string {
  return `https://crafatar.com/avatars/${uuid}?size=${size}&overlay`
}

/**
 * "115× Verdant (278.6K)" — one ingredient's *total* across every fusion
 * attempt needed (fuseAmount × how many attempts), not just what one
 * attempt costs, since a single fusion only yields 1-2 shards and reaching
 * an attribute's full `shardsNeeded` takes many attempts. The shard name
 * renders at full contrast, its cost in accent color, so the line scans at
 * a glance instead of reading as one long muted sentence.
 */
function FusionIngredientLabel({
  ingredient,
  attempts
}: {
  ingredient: FusionIngredient
  attempts: number
}): React.JSX.Element {
  const quantity = ingredient.fuseAmount * attempts
  const cost = ingredient.cost !== null ? ingredient.cost * attempts : null
  return (
    <span className={s.fusionIngredient}>
      {quantity.toLocaleString()}× {ingredient.name}{' '}
      <span className={`font-tabular ${s.fusionIngredientCost}`}>
        ({cost !== null ? formatPrice(cost) : 'no price'})
      </span>
    </span>
  )
}

type SubView = 'fusion' | 'cheapest'

/**
 * Attribute Fusion (combine two shards at the Fusion Machine for a chance
 * — no, always, per its own recipe rules — at a third) is a real game
 * mechanic; see `src/main/attributes/data/README.md` for the full research
 * trail and the data source (Campionnn/SkyShards-Parser).
 *
 * Two independent views: "Fusion Browser" (player-agnostic — every shard's
 * cheapest known recipe by current price) and "Cheapest to Max" (needs a
 * player/profile, via the same shared `selection` MP Calculator and Stats
 * Viewer use — combines a player's actual attribute progress with shard
 * prices to rank which attribute is cheapest to finish next).
 */
export default function AttributeCalculatorTool({
  selection,
  setSelection
}: PlayerSelectionProps): React.JSX.Element {
  const [subView, setSubView] = useState<SubView>('fusion')

  return (
    <div className={s.page}>
      <h1 className={`font-hand ${s.title}`}>Attribute Calculator</h1>
      <p className={s.subtitle}>
        Shard fusion recipes and costs, or the cheapest attribute to finish next.
      </p>

      <div className={s.subNav}>
        <SketchButton
          variant={subView === 'fusion' ? 'primary' : 'default'}
          onClick={() => setSubView('fusion')}
        >
          Fusion Browser
        </SketchButton>
        <SketchButton
          variant={subView === 'cheapest' ? 'primary' : 'default'}
          onClick={() => setSubView('cheapest')}
        >
          Cheapest to Max
        </SketchButton>
      </div>

      {subView === 'fusion' ? (
        <FusionBrowser />
      ) : (
        <CheapestToMax selection={selection} setSelection={setSelection} />
      )}
    </div>
  )
}

function FusionBrowser(): React.JSX.Element {
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()
  const queryKey = ['attributeFusion']
  const query = useQuery({
    queryKey,
    queryFn: () => api.resources.getAttributeFusion()
  })

  const refreshMutation = useMutation({
    mutationFn: () => api.resources.getAttributeFusion(true),
    onSuccess: (data) => queryClient.setQueryData(queryKey, data)
  })

  const filtered = useMemo(() => {
    const targets = query.data?.targets ?? []
    const term = search.trim().toLowerCase()
    if (!term) return targets
    return targets.filter(
      (t) => t.name.toLowerCase().includes(term) || t.abilityName?.toLowerCase().includes(term)
    )
  }, [query.data, search])

  if (query.isLoading) return <SkeletonRows count={8} />
  if (query.isError) {
    return (
      <p className="error-text">
        {query.error instanceof Error ? query.error.message : 'Failed to load fusion recipes.'}
      </p>
    )
  }
  if (!query.data) return <></>

  return (
    <div>
      <div className={s.toolbar}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search shards or attributes…"
          className={`ruled-input font-hand ${s.searchInput}`}
        />
        <SketchButton onClick={() => refreshMutation.mutate()} disabled={refreshMutation.isPending}>
          {refreshMutation.isPending ? 'Refreshing…' : '↻ Refresh prices'}
        </SketchButton>
      </div>
      <p className={`font-hand ${s.mutedText}`} style={{ marginBottom: 12 }}>
        {filtered.length} of {query.data.targets.length} shards obtainable via fusion — cheapest
        cost per shard first.
      </p>
      {filtered.length === 0 ? (
        <p className={`font-hand ${s.emptyState}`}>No shard or attribute matches "{search}".</p>
      ) : (
        <div className={s.list}>
          {filtered.map((target) => (
            <FusionRecipeRow key={target.key} target={target} />
          ))}
        </div>
      )}
    </div>
  )
}

function CheapestToMax({ selection, setSelection }: PlayerSelectionProps): React.JSX.Element {
  const [input, setInput] = useState('')

  const resolveMutation = useMutation({
    mutationFn: (usernameOrUuid: string) => api.player.resolve(usernameOrUuid),
    onSuccess: (player) => setSelection({ player, profileId: null, cuteName: null })
  })

  if (!selection.player) {
    return (
      <div>
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
      </div>
    )
  }

  if (!selection.profileId || !selection.cuteName) {
    return (
      <ProfilePicker
        player={selection.player}
        onBack={() => setSelection({ player: null, profileId: null, cuteName: null })}
        onSelect={(profileId, cuteName) =>
          setSelection({ player: selection.player, profileId, cuteName })
        }
      />
    )
  }

  return (
    <CheapestToMaxResult
      player={selection.player}
      profileId={selection.profileId}
      cuteName={selection.cuteName}
      onBack={() => setSelection({ player: selection.player, profileId: null, cuteName: null })}
    />
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

function CheapestToMaxResult({
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
  const queryKey = ['cheapestAttributesToMax', profileId, player.uuid]
  const query = useQuery({
    queryKey,
    queryFn: () => api.member.getCheapestAttributesToMax(profileId, player.uuid)
  })

  const refreshMutation = useMutation({
    mutationFn: () => api.member.getCheapestAttributesToMax(profileId, player.uuid, true),
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
          {query.error instanceof Error ? query.error.message : 'Failed to load attributes.'}
        </p>
      )}
      {query.data && !query.data.apiEnabled && (
        <p className={`font-hand ${s.mutedText}`}>
          this player has no attribute data available for this profile.
        </p>
      )}

      {query.data?.apiEnabled && (
        <div>
          <p className={`font-hand ${s.mutedText}`} style={{ marginBottom: 12 }}>
            Ranked by total coins to reach Level 10 — cheapest first.
          </p>
          {query.data.attributes.length === 0 ? (
            <p className={`font-hand ${s.emptyState}`}>
              Every catalogued attribute is already maxed.
            </p>
          ) : (
            <div className={s.list}>
              {query.data.attributes.map((attr) => {
                const color = getRarityColor(attr.rarity.toLowerCase())
                const iconUrl = getAttributeIconUrl(attr.key) ?? GENERIC_SHARD_ICON_URL
                // A single fusion only yields outputCount (1-2) shards — how many
                // times you'd actually have to fuse to cover shardsNeeded.
                const fusionAttempts = attr.fusionRecipe
                  ? Math.ceil(attr.shardsNeeded / attr.fusionRecipe.outputCount)
                  : 0
                return (
                  <div key={attr.key} className={s.maxRow}>
                    {iconUrl ? (
                      <img src={iconUrl} alt="" className={s.maxIcon} />
                    ) : (
                      <span className={s.maxPlaceholder} style={{ backgroundColor: color }} />
                    )}
                    <div className={s.maxBody}>
                      <span className="font-hand" style={{ color }}>
                        {attr.shardName ?? attr.name}
                      </span>
                      {attr.shardName && <span className={s.abilityName}> ({attr.name})</span>}
                      <p className={`font-tabular ${s.maxMeta}`}>
                        Lv {attr.level}/10 · {attr.shardsNeeded.toLocaleString()} shards needed
                        {attr.costSource &&
                          ` · cheapest by ${attr.costSource === 'buy' ? 'buying' : 'fusing'}`}
                      </p>
                      {attr.fusionRecipe && (
                        <p className={`font-hand ${s.fusionRecipeText}`}>
                          <span className={s.fusionLabel}>Fuse</span>{' '}
                          <FusionIngredientLabel
                            ingredient={attr.fusionRecipe.inputA}
                            attempts={fusionAttempts}
                          />{' '}
                          <span className={s.fusionLabel}>+</span>{' '}
                          <FusionIngredientLabel
                            ingredient={attr.fusionRecipe.inputB}
                            attempts={fusionAttempts}
                          />{' '}
                          <span className={s.fusionLabel}>
                            ({fusionAttempts.toLocaleString()}× fusion,{' '}
                            {attr.fusionRecipe.outputCount}/each)
                          </span>
                        </p>
                      )}
                    </div>
                    <div className={s.cost}>
                      <span
                        className={`font-tabular ${attr.totalCost !== null ? s.costValue : s.noPrice}`}
                      >
                        {attr.totalCost !== null ? formatPrice(attr.totalCost) : 'no price data'}
                      </span>
                      {attr.costPerShard !== null && (
                        <span className={`font-tabular ${s.totalCost}`}>
                          {formatPrice(attr.costPerShard)}/shard
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
