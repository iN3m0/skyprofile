import { ipcMain } from 'electron'
import type { AppStatus, ApiKeyStatus, TestConnectionResult } from '@shared/types/ipc'
import * as settings from '../settings/store'
import { hypixelGet, HypixelApiError, MissingApiKeyError } from '../hypixel/client'
import { HypixelPaths } from '../hypixel/endpoints'
import { getRateLimitState } from '../hypixel/rateLimiter'

async function testConnection(): Promise<TestConnectionResult> {
  try {
    await hypixelGet(HypixelPaths.punishmentStats)
    return { ok: true }
  } catch (error) {
    if (error instanceof MissingApiKeyError) {
      return { ok: false, error: error.message }
    }
    if (error instanceof HypixelApiError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:getApiKey', (): ApiKeyStatus => {
    return { hasApiKey: settings.hasApiKey() }
  })

  ipcMain.handle(
    'settings:setApiKey',
    async (_event, { apiKey }: { apiKey: string }): Promise<TestConnectionResult> => {
      const trimmed = apiKey.trim()
      if (!trimmed) {
        return { ok: false, error: 'API key cannot be empty' }
      }
      settings.setApiKey(trimmed)
      const result = await testConnection()
      if (!result.ok) {
        // Don't keep an invalid key around silently.
        settings.clearApiKey()
      }
      return result
    }
  )

  ipcMain.handle('settings:clearApiKey', (): { ok: true } => {
    settings.clearApiKey()
    return { ok: true }
  })

  ipcMain.handle('settings:testConnection', async (): Promise<TestConnectionResult> => {
    return testConnection()
  })

  ipcMain.handle('app:getStatus', (): AppStatus => {
    const rateLimit = getRateLimitState()
    return {
      hasApiKey: settings.hasApiKey(),
      rateLimitRemaining: rateLimit.remaining,
      rateLimitLimit: rateLimit.limit,
      rateLimitReset: rateLimit.reset
    }
  })
}
