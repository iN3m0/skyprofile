import { ipcMain } from 'electron'
import type { SkillsSummary } from '@shared/types/skills'
import type { CollectionsSummary } from '@shared/types/collections'
import type { MemberInventory } from '@shared/types/item'
import type { AccessoriesSummary } from '@shared/types/accessories'
import type { PetsSummary } from '@shared/types/pet'
import type { BestiarySummary } from '@shared/types/bestiary'
import type { MinionsSummary } from '@shared/types/minion'
import type { AttributesSummary } from '@shared/types/attribute'
import type { MuseumSummary } from '@shared/types/museum'
import type { SlayerSummary } from '@shared/types/slayer'
import type { DungeonsSummary } from '@shared/types/dungeons'
import type { PlayerOverviewSummary } from '@shared/types/overview'
import type { CheapestAttributesToMaxSummary } from '@shared/types/attributeFusion'
import type { MuseumCalculatorSummary } from '@shared/types/museumCalculator'
import type { SkyblockXpCalculatorSummary } from '@shared/types/xpCalculator'
import { getMember, getRawProfile } from '../hypixel/profileService'
import { getPlayerAchievements } from '../hypixel/achievements'
import { invalidate } from '../cache/cacheStore'
import { computeSkills } from '../skills/skillsService'
import { computeCollections } from '../collections/collectionsService'
import { computeInventory } from '../inventory/inventoryService'
import { computeAccessories } from '../accessories/accessoryService'
import { computePets } from '../pets/petService'
import { computeBestiary } from '../bestiary/bestiaryService'
import { computeMinions } from '../minions/minionService'
import { computeAttributes } from '../attributes/attributeService'
import { computeCheapestAttributesToMax } from '../attributes/fusionService'
import { computeMuseum } from '../museum/museumService'
import { computeMuseumCalculator } from '../museum/museumCalculatorService'
import { computeSkyblockXpCalculator } from '../xpcalculator/xpCalculatorService'
import { computeSlayer } from '../slayer/slayerService'
import { computeDungeons } from '../dungeons/dungeonService'
import { computeOverview } from '../overview/overviewService'

export function registerMemberHandlers(): void {
  ipcMain.handle(
    'member:getSkills',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<SkillsSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      // Taming's real level cap lives on the player's Hypixel achievement
      // total, not the profile itself — a separate endpoint, so it's
      // fetched alongside and just left null (base cap only) if it fails.
      const achievements = await getPlayerAchievements(uuid).catch(() => ({}) as Record<string, number>)
      return computeSkills(member, achievements.skyblock_domesticator ?? null)
    }
  )

  ipcMain.handle(
    'member:getCollections',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<CollectionsSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeCollections(profile, member)
    }
  )

  ipcMain.handle(
    'member:getInventory',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<MemberInventory> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeInventory(profile, member)
    }
  )

  ipcMain.handle(
    'member:getAccessories',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<AccessoriesSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      const inventory = await computeInventory(profile, member)
      return computeAccessories(inventory)
    }
  )

  ipcMain.handle(
    'member:getPets',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<PetsSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computePets(profile, member)
    }
  )

  ipcMain.handle(
    'member:getBestiary',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<BestiarySummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeBestiary(member)
    }
  )

  ipcMain.handle(
    'member:getMinions',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<MinionsSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeMinions(profile, member)
    }
  )

  ipcMain.handle(
    'member:getAttributes',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<AttributesSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeAttributes(member)
    }
  )

  ipcMain.handle(
    'member:getCheapestAttributesToMax',
    async (
      _event,
      { profileId, uuid, force }: { profileId: string; uuid: string; force?: boolean }
    ): Promise<CheapestAttributesToMaxSummary> => {
      // A manual refresh needs fresh attribute stacks too (the player may
      // have just syphoned/fused in-game), not just fresh prices — so also
      // drop the 60s profile cache rather than only forwarding `force`.
      if (force) invalidate(`profile:${profileId}`)
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeCheapestAttributesToMax(member, force)
    }
  )

  // Museum is a separate top-level Hypixel endpoint, not a field on the
  // profile response — computeMuseum fetches it directly rather than
  // going through getRawProfile/getMember like every other handler here.
  ipcMain.handle(
    'member:getMuseum',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<MuseumSummary> => {
      return computeMuseum(profileId, uuid)
    }
  )

  ipcMain.handle(
    'member:getMuseumCalculator',
    async (
      _event,
      { profileId, uuid, force }: { profileId: string; uuid: string; force?: boolean }
    ): Promise<MuseumCalculatorSummary> => {
      return computeMuseumCalculator(profileId, uuid, force)
    }
  )

  ipcMain.handle(
    'member:getSkyblockXpCalculator',
    async (
      _event,
      { profileId, uuid, force }: { profileId: string; uuid: string; force?: boolean }
    ): Promise<SkyblockXpCalculatorSummary> => {
      // A manual refresh should reflect anything just bought/donated, not
      // just fresh prices — museumCalculatorService already invalidates
      // its own museum-data cache internally on force; also drop the
      // profile cache here so accessories/inventory are fresh too.
      if (force) invalidate(`profile:${profileId}`)
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeSkyblockXpCalculator(profile, member, profileId, uuid, force)
    }
  )

  ipcMain.handle(
    'member:getSlayer',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<SlayerSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeSlayer(member)
    }
  )

  ipcMain.handle(
    'member:getDungeons',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<DungeonsSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeDungeons(member)
    }
  )

  ipcMain.handle(
    'member:getOverview',
    async (
      _event,
      { profileId, uuid }: { profileId: string; uuid: string }
    ): Promise<PlayerOverviewSummary> => {
      const profile = await getRawProfile(profileId)
      const member = getMember(profile, uuid)
      return computeOverview(profile, member, profileId, uuid)
    }
  )
}
