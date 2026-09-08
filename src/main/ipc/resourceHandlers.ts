import { ipcMain } from 'electron'
import type { AttributeFusionSummary } from '@shared/types/attributeFusion'
import type { CalendarSummary } from '@shared/types/calendar'
import { getItemSkinUrls } from '../hypixel/resources'
import { computeAttributeFusion } from '../attributes/fusionService'
import { computeCalendar } from '../calendar/calendarService'

export function registerResourceHandlers(): void {
  ipcMain.handle('resources:getItemSkins', async (): Promise<Record<string, string>> => {
    return getItemSkinUrls()
  })

  // Global game state, not tied to any player/profile — same reasoning as
  // the fusion resource below.
  ipcMain.handle('resources:getCalendar', async (): Promise<CalendarSummary> => {
    return computeCalendar()
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
