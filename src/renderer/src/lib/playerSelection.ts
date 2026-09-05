import type { Player } from '@shared/types/player'

/**
 * Which player + profile is currently "loaded" — lifted up to App so it's
 * shared across every top-level view (the Search tab's stats tracker, and
 * any sidebar tool that also needs a player/profile, like MP Calculator).
 * Switching between them should never require re-searching: whichever one
 * set this last is what the next one sees too.
 */
export interface PlayerSelection {
  player: Player | null
  profileId: string | null
  cuteName: string | null
}

export const EMPTY_SELECTION: PlayerSelection = { player: null, profileId: null, cuteName: null }

export interface PlayerSelectionProps {
  selection: PlayerSelection
  setSelection: (selection: PlayerSelection) => void
}
