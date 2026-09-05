import { contextBridge, ipcRenderer } from 'electron'
import type { IpcChannel, IpcRequest, IpcResponse } from '@shared/types/ipc'

/**
 * Thin, typed wrapper around ipcRenderer.invoke — the only IPC surface
 * exposed to the renderer. No raw ipcRenderer, no channel wildcards.
 */
function invoke<C extends IpcChannel>(channel: C, request: IpcRequest<C>): Promise<IpcResponse<C>> {
  return ipcRenderer.invoke(channel, request)
}

const api = {
  settings: {
    getApiKey: () => invoke('settings:getApiKey', undefined),
    setApiKey: (apiKey: string) => invoke('settings:setApiKey', { apiKey }),
    clearApiKey: () => invoke('settings:clearApiKey', undefined),
    testConnection: () => invoke('settings:testConnection', undefined)
  },
  app: {
    getStatus: () => invoke('app:getStatus', undefined)
  },
  player: {
    resolve: (usernameOrUuid: string) => invoke('player:resolve', { usernameOrUuid }),
    getProfiles: (uuid: string) => invoke('player:getProfiles', { uuid })
  },
  profile: {
    get: (profileId: string) => invoke('profile:get', { profileId })
  },
  member: {
    getSkills: (profileId: string, uuid: string) => invoke('member:getSkills', { profileId, uuid }),
    getCollections: (profileId: string, uuid: string) =>
      invoke('member:getCollections', { profileId, uuid }),
    getInventory: (profileId: string, uuid: string) =>
      invoke('member:getInventory', { profileId, uuid }),
    getAccessories: (profileId: string, uuid: string) =>
      invoke('member:getAccessories', { profileId, uuid }),
    getPets: (profileId: string, uuid: string) => invoke('member:getPets', { profileId, uuid }),
    getBestiary: (profileId: string, uuid: string) =>
      invoke('member:getBestiary', { profileId, uuid }),
    getMinions: (profileId: string, uuid: string) =>
      invoke('member:getMinions', { profileId, uuid }),
    getAttributes: (profileId: string, uuid: string) =>
      invoke('member:getAttributes', { profileId, uuid }),
    getMuseum: (profileId: string, uuid: string) => invoke('member:getMuseum', { profileId, uuid }),
    getSlayer: (profileId: string, uuid: string) => invoke('member:getSlayer', { profileId, uuid }),
    getDungeons: (profileId: string, uuid: string) =>
      invoke('member:getDungeons', { profileId, uuid }),
    getOverview: (profileId: string, uuid: string) =>
      invoke('member:getOverview', { profileId, uuid }),
    getCheapestAttributesToMax: (profileId: string, uuid: string, force?: boolean) =>
      invoke('member:getCheapestAttributesToMax', { profileId, uuid, force }),
    getMuseumCalculator: (profileId: string, uuid: string, force?: boolean) =>
      invoke('member:getMuseumCalculator', { profileId, uuid, force }),
    getSkyblockXpCalculator: (profileId: string, uuid: string, force?: boolean) =>
      invoke('member:getSkyblockXpCalculator', { profileId, uuid, force })
  },
  resources: {
    getItemSkins: () => invoke('resources:getItemSkins', undefined),
    getAttributeFusion: (force?: boolean) => invoke('resources:getAttributeFusion', { force })
  }
}

export type Api = typeof api

// contextIsolation is always enabled for this app's windows (see
// src/main/index.ts), so contextBridge is the only path exposure ever takes.
try {
  contextBridge.exposeInMainWorld('api', api)
} catch (error) {
  console.error(error)
}
