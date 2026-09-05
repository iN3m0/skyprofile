import { ipcMain } from 'electron'
import type { Player } from '@shared/types/player'
import type { SkyblockProfileSummary } from '@shared/types/profile'
import { resolvePlayer } from '../resolvePlayer'
import { hypixelGet } from '../hypixel/client'
import { HypixelPaths } from '../hypixel/endpoints'

interface RawProfilesResponse {
  success: boolean
  profiles: Array<{
    profile_id: string
    cute_name: string
    game_mode?: string
    selected?: boolean
  }> | null
}

export function registerPlayerHandlers(): void {
  ipcMain.handle(
    'player:resolve',
    async (_event, { usernameOrUuid }: { usernameOrUuid: string }): Promise<Player> => {
      return resolvePlayer(usernameOrUuid)
    }
  )

  ipcMain.handle(
    'player:getProfiles',
    async (_event, { uuid }: { uuid: string }): Promise<SkyblockProfileSummary[]> => {
      const data = await hypixelGet<RawProfilesResponse>(HypixelPaths.skyblockProfiles, { uuid })
      const profiles = data.profiles ?? []
      return profiles.map((p) => ({
        profileId: p.profile_id,
        cuteName: p.cute_name,
        gameMode: p.game_mode ?? null,
        selected: p.selected ?? false
      }))
    }
  )
}
