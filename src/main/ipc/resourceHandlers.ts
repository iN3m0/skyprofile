import { ipcMain } from 'electron'
import type { AttributeFusionSummary } from '@shared/types/attributeFusion'
import { getItemSkinUrls } from '../hypixel/resources'
import { computeAttributeFusion } from '../attributes/fusionService'

export function registerResourceHandlers(): void {
  ipcMain.handle('resources:getItemSkins', async (): Promise<Record<string, string>> => {
    return getItemSkinUrls()
  })

  // Player-agnostic — every shard's fusion recipes and current prices,
  // not tied to any profile — so it belongs alongside the other pure
  // resource lookups rather than in memberHandlers.
  ipcMain.handle(
    'resources:getAttributeFusion',
    async (_event, { force }: { force?: boolean }): Promise<AttributeFusionSummary> => {
      return computeAttributeFusion(force)
    }
  )
}
