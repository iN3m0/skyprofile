import type {
  ExcludedXpSource,
  SkyblockXpCalculatorSummary,
  SkyblockXpEntry
} from '@shared/types/xpCalculator'
import type { RawHypixelMember, RawHypixelProfile } from '../hypixel/profileService'
// skyhelper-networth is already a project dependency (accessories/
// attributes/museum all reuse its price list) — same source here, for the
// Bank Upgrade tiers' Enchanted Gold Block cost.
import { getPrices } from 'skyhelper-networth'
import { computeInventory } from '../inventory/inventoryService'
import { computeAccessories } from '../accessories/accessoryService'
import { computeMuseumCalculator } from '../museum/museumCalculatorService'
import { createCraftCostCache } from '../shared/craftCostService'
import { computeMinionXpEntries } from './minionXpService'
import { computePetXpEntries } from './petXpService'
import { computeEssenceXpEntries } from './essenceXpService'
import bankUpgradesRaw from './data/bankUpgrades.json'

interface BankUpgradeTier {
  tier: string
  enchantedGoldBlocks: number
  coins: number
  xp: number
}
const BANK_UPGRADES = bankUpgradesRaw as BankUpgradeTier[]

// See data/README.md for the full research trail on why each of these is
// excluded (either not actually a coin-buyable SkyBlock XP source at all,
// or real but not priceable yet without substantially more work).
const EXCLUDED_SOURCES: ExcludedXpSource[] = [
  {
    name: 'Abiphone Contacts',
    reason:
      "Each contact is unlocked by an NPC-specific quest (the wiki categorizes them by Easy/Medium/Hard difficulty, not a coin price) — there's no cost to rank by."
  },
  {
    name: 'Personal Bank Upgrades',
    reason:
      'Gated by Emerald Collection milestones only — no coin cost at all, so nothing to rank by.'
  },
  {
    name: 'Community Shop Upgrades',
    reason:
      'Priced in Bits (a weekly-earned currency), not coins — not a like-for-like "coins per XP" comparison with everything else here.'
  },
  {
    name: 'Attributes',
    reason:
      "Attribute Fusion grants Hunting skill XP, not SkyBlock XP (confirmed via the wiki) — it just doesn't belong in this particular calculator."
  },
  {
    name: 'Fast Travel',
    reason:
      'Checked Hypixel\'s own full "Ways to Gain SkyBlock XP" list — fast travel isn\'t a SkyBlock XP source at all.'
  }
]

function sortByCostPerXpAscendingNullsLast(entries: SkyblockXpEntry[]): SkyblockXpEntry[] {
  return [...entries].sort((a, b) => {
    if (a.costPerXp === null && b.costPerXp === null) return 0
    if (a.costPerXp === null) return 1
    if (b.costPerXp === null) return -1
    return a.costPerXp - b.costPerXp
  })
}

/**
 * "Cheapest cost per SkyBlock XP": combines every coin-buyable SkyBlock XP
 * source this app has real cost data for — Museum donations, Magical
 * Power (Accessory Bag Upgrades convert 1:1 to XP), Bank Upgrade tiers,
 * Craft Minions, Pet Score, and Essence Shop Upgrades — into one ranked
 * list. See data/README.md for why Abiphone Contacts, Personal Bank
 * Upgrades, Community Shop Upgrades, Attributes, and Fast Travel aren't
 * included, reported back to the caller as `excludedSources` rather than
 * silently dropped.
 */
export async function computeSkyblockXpCalculator(
  profile: RawHypixelProfile,
  member: RawHypixelMember,
  profileId: string,
  uuid: string,
  force = false
): Promise<SkyblockXpCalculatorSummary> {
  const [inventory, museumSummary, prices] = await Promise.all([
    computeInventory(profile, member),
    computeMuseumCalculator(profileId, uuid, force),
    getPrices(!force).catch(() => ({}) as Record<string, number>)
  ])

  if (!inventory.apiEnabled && !museumSummary.apiEnabled) {
    return { apiEnabled: false, entries: [], excludedSources: EXCLUDED_SOURCES }
  }

  const entries: SkyblockXpEntry[] = []

  const minionEntries = await computeMinionXpEntries(profile, prices, createCraftCostCache())
  entries.push(...minionEntries)
  entries.push(...computePetXpEntries(profile, member, prices))
  entries.push(...computeEssenceXpEntries(prices))

  if (museumSummary.apiEnabled) {
    for (const item of museumSummary.entries) {
      entries.push({
        source: 'museum',
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        xp: item.xp,
        cost: item.cost,
        costPerXp: item.costPerXp
      })
    }
  }

  const accessories = await computeAccessories(inventory)
  if (accessories.apiEnabled) {
    // "Accessory Bag Upgrades" grants +1 SkyBlock XP per point of Magical
    // Power — the exact same cost-per-MP the MP Calculator already ranks
    // missing/upgrade accessories by, so each entry here is "the cost of
    // one marginal XP" rather than one discrete reward's total cost.
    for (const mp of accessories.mpCalculator) {
      entries.push({
        source: 'accessories',
        itemId: mp.itemId,
        name: mp.name,
        category: 'Accessories',
        xp: 1,
        cost: mp.costPerMp,
        costPerXp: mp.costPerMp
      })
    }
  }

  const enchantedGoldBlockPrice = prices['ENCHANTED_GOLD_BLOCK'] ?? null
  for (const tier of BANK_UPGRADES) {
    const cost =
      enchantedGoldBlockPrice !== null
        ? tier.enchantedGoldBlocks * enchantedGoldBlockPrice + tier.coins
        : null
    entries.push({
      source: 'bank',
      itemId: null,
      name: `${tier.tier} Bank Upgrade`,
      category: 'Bank',
      xp: tier.xp,
      cost,
      costPerXp: cost !== null ? cost / tier.xp : null
    })
  }

  return {
    apiEnabled: true,
    entries: sortByCostPerXpAscendingNullsLast(entries),
    excludedSources: EXCLUDED_SOURCES
  }
}
