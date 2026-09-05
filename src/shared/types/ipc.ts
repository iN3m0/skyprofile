/**
 * IPC channel contract shared between main, preload, and renderer.
 * Every channel used by `ipcRenderer.invoke` / `ipcMain.handle` should be
 * listed here with its request and response shapes so all three processes
 * stay in sync at compile time.
 */
import type { Player } from './player'
import type { RawSkyblockProfile, SkyblockProfileSummary } from './profile'
import type { SkillsSummary } from './skills'
import type { CollectionsSummary } from './collections'
import type { MemberInventory } from './item'
import type { AccessoriesSummary } from './accessories'
import type { PetsSummary } from './pet'
import type { BestiarySummary } from './bestiary'
import type { MinionsSummary } from './minion'
import type { AttributesSummary } from './attribute'
import type { MuseumSummary } from './museum'
import type { SlayerSummary } from './slayer'
import type { DungeonsSummary } from './dungeons'
import type { PlayerOverviewSummary } from './overview'
import type { AttributeFusionSummary, CheapestAttributesToMaxSummary } from './attributeFusion'
import type { MuseumCalculatorSummary } from './museumCalculator'
import type { SkyblockXpCalculatorSummary } from './xpCalculator'

export interface ApiKeyStatus {
  hasApiKey: boolean
}

export interface TestConnectionResult {
  ok: boolean
  error?: string
}

export interface AppStatus {
  hasApiKey: boolean
  rateLimitRemaining: number | null
  rateLimitLimit: number | null
  rateLimitReset: number | null
}

export interface IpcChannels {
  'settings:getApiKey': {
    request: void
    response: ApiKeyStatus
  }
  'settings:setApiKey': {
    request: { apiKey: string }
    response: TestConnectionResult
  }
  'settings:clearApiKey': {
    request: void
    response: { ok: true }
  }
  'settings:testConnection': {
    request: void
    response: TestConnectionResult
  }
  'app:getStatus': {
    request: void
    response: AppStatus
  }
  'player:resolve': {
    request: { usernameOrUuid: string }
    response: Player
  }
  'player:getProfiles': {
    request: { uuid: string }
    response: SkyblockProfileSummary[]
  }
  'profile:get': {
    request: { profileId: string }
    response: RawSkyblockProfile
  }
  'member:getSkills': {
    request: { profileId: string; uuid: string }
    response: SkillsSummary
  }
  'member:getCollections': {
    request: { profileId: string; uuid: string }
    response: CollectionsSummary
  }
  'resources:getItemSkins': {
    request: void
    response: Record<string, string>
  }
  'member:getInventory': {
    request: { profileId: string; uuid: string }
    response: MemberInventory
  }
  'member:getAccessories': {
    request: { profileId: string; uuid: string }
    response: AccessoriesSummary
  }
  'member:getPets': {
    request: { profileId: string; uuid: string }
    response: PetsSummary
  }
  'member:getBestiary': {
    request: { profileId: string; uuid: string }
    response: BestiarySummary
  }
  'member:getMinions': {
    request: { profileId: string; uuid: string }
    response: MinionsSummary
  }
  'member:getAttributes': {
    request: { profileId: string; uuid: string }
    response: AttributesSummary
  }
  'member:getMuseum': {
    request: { profileId: string; uuid: string }
    response: MuseumSummary
  }
  'member:getSlayer': {
    request: { profileId: string; uuid: string }
    response: SlayerSummary
  }
  'member:getDungeons': {
    request: { profileId: string; uuid: string }
    response: DungeonsSummary
  }
  'member:getOverview': {
    request: { profileId: string; uuid: string }
    response: PlayerOverviewSummary
  }
  'resources:getAttributeFusion': {
    /** `force: true` bypasses skyhelper-networth's 5-minute price cache — for a manual refresh after buying/selling. */
    request: { force?: boolean }
    response: AttributeFusionSummary
  }
  'member:getCheapestAttributesToMax': {
    /** `force: true` bypasses both the price cache and this app's 60s profile cache — for a manual refresh. */
    request: { profileId: string; uuid: string; force?: boolean }
    response: CheapestAttributesToMaxSummary
  }
  'member:getMuseumCalculator': {
    /** `force: true` bypasses both the price cache and this app's 60s museum-data cache — for a manual refresh. */
    request: { profileId: string; uuid: string; force?: boolean }
    response: MuseumCalculatorSummary
  }
  'member:getSkyblockXpCalculator': {
    /** `force: true` bypasses the price cache and this app's 60s profile/museum-data caches — for a manual refresh. */
    request: { profileId: string; uuid: string; force?: boolean }
    response: SkyblockXpCalculatorSummary
  }
}

export type IpcChannel = keyof IpcChannels
export type IpcRequest<C extends IpcChannel> = IpcChannels[C]['request']
export type IpcResponse<C extends IpcChannel> = IpcChannels[C]['response']
