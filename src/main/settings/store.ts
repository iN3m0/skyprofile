import Store from 'electron-store'

interface SettingsSchema {
  apiKey: string | null
}

/**
 * Local, unencrypted settings store (backed by a JSON file in the OS
 * user-data directory, outside the repo). Currently holds only the
 * Hypixel API key. Never log or expose the raw store contents to the
 * renderer — only narrow, purpose-built values should cross the IPC
 * boundary (see src/main/ipc/settingsHandlers.ts).
 */
const store = new Store<SettingsSchema>({
  name: 'settings',
  defaults: {
    apiKey: null
  }
})

export function getApiKey(): string | null {
  return store.get('apiKey')
}

export function setApiKey(apiKey: string): void {
  store.set('apiKey', apiKey)
}

export function clearApiKey(): void {
  store.set('apiKey', null)
}

export function hasApiKey(): boolean {
  const key = getApiKey()
  return typeof key === 'string' && key.trim().length > 0
}
