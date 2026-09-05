import { ipcMain } from 'electron'
import type { RawSkyblockProfile } from '@shared/types/profile'
import { getRawProfile } from '../hypixel/profileService'

export function registerProfileHandlers(): void {
  ipcMain.handle(
    'profile:get',
    async (_event, { profileId }: { profileId: string }): Promise<RawSkyblockProfile> => {
      const p = await getRawProfile(profileId)
      return {
        profileId: p.profile_id,
        cuteName: p.cute_name,
        gameMode: p.game_mode ?? null,
        members: p.members,
        banking: p.banking ?? null
      }
    }
  )
}
