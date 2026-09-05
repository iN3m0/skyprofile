import type { Rarity } from '@shared/types/item'

/**
 * Accessory upgrade-chain data — which Hypixel item ids form an upgrade
 * family (Talisman → Ring → Artifact → Relic, etc.), which ids are
 * unobtainable/event-locked and shouldn't count as "missing", and which
 * ids are cosmetic duplicates of another id ("aliases"). This is factual
 * game-design data (item id relationships), not creative content — ported
 * from SkyCrypt's `src/constants/accessories.js`, itself credited there to
 * github.com/MattTheCuber, the same way NotEnoughUpdates/NEU's item
 * database is shared freely across the Skyblock tool ecosystem.
 */
export const ACCESSORY_UPGRADES: string[][] = [
  ['WOLF_TALISMAN', 'WOLF_RING'],
  ['POTION_AFFINITY_TALISMAN', 'RING_POTION_AFFINITY', 'ARTIFACT_POTION_AFFINITY'],
  ['FEATHER_TALISMAN', 'FEATHER_RING', 'FEATHER_ARTIFACT'],
  ['SEA_CREATURE_TALISMAN', 'SEA_CREATURE_RING', 'SEA_CREATURE_ARTIFACT'],
  ['HEALING_TALISMAN', 'HEALING_RING'],
  ['CANDY_TALISMAN', 'CANDY_RING', 'CANDY_ARTIFACT', 'CANDY_RELIC'],
  ['INTIMIDATION_TALISMAN', 'INTIMIDATION_RING', 'INTIMIDATION_ARTIFACT', 'INTIMIDATION_RELIC'],
  ['SPIDER_TALISMAN', 'SPIDER_RING', 'SPIDER_ARTIFACT'],
  ['RED_CLAW_TALISMAN', 'RED_CLAW_RING', 'RED_CLAW_ARTIFACT'],
  ['HUNTER_TALISMAN', 'HUNTER_RING'],
  ['ZOMBIE_TALISMAN', 'ZOMBIE_RING', 'ZOMBIE_ARTIFACT'],
  ['BAT_TALISMAN', 'BAT_RING', 'BAT_ARTIFACT'],
  ['SPEED_TALISMAN', 'SPEED_RING', 'SPEED_ARTIFACT'],
  [
    'PERSONAL_COMPACTOR_4000',
    'PERSONAL_COMPACTOR_5000',
    'PERSONAL_COMPACTOR_6000',
    'PERSONAL_COMPACTOR_7000'
  ],
  [
    'PERSONAL_DELETOR_4000',
    'PERSONAL_DELETOR_5000',
    'PERSONAL_DELETOR_6000',
    'PERSONAL_DELETOR_7000'
  ],
  ['SCARF_STUDIES', 'SCARF_THESIS', 'SCARF_GRIMOIRE'],
  ['CAT_TALISMAN', 'LYNX_TALISMAN', 'CHEETAH_TALISMAN'],
  ['SHADY_RING', 'CROOKED_ARTIFACT', 'SEAL_OF_THE_FAMILY'],
  ['TREASURE_TALISMAN', 'TREASURE_RING', 'TREASURE_ARTIFACT'],
  [
    'BEASTMASTER_CREST_COMMON',
    'BEASTMASTER_CREST_UNCOMMON',
    'BEASTMASTER_CREST_RARE',
    'BEASTMASTER_CREST_EPIC',
    'BEASTMASTER_CREST_LEGENDARY'
  ],
  [
    'RAGGEDY_SHARK_TOOTH_NECKLACE',
    'DULL_SHARK_TOOTH_NECKLACE',
    'HONED_SHARK_TOOTH_NECKLACE',
    'SHARP_SHARK_TOOTH_NECKLACE',
    'RAZOR_SHARP_SHARK_TOOTH_NECKLACE'
  ],
  ['BAT_PERSON_TALISMAN', 'BAT_PERSON_RING', 'BAT_PERSON_ARTIFACT'],
  ['LUCKY_HOOF', 'ETERNAL_HOOF'],
  ['WITHER_ARTIFACT', 'WITHER_RELIC'],
  ['WEDDING_RING_0', 'WEDDING_RING_2', 'WEDDING_RING_4', 'WEDDING_RING_7', 'WEDDING_RING_9'],
  [
    'CAMPFIRE_TALISMAN_1',
    'CAMPFIRE_TALISMAN_4',
    'CAMPFIRE_TALISMAN_8',
    'CAMPFIRE_TALISMAN_13',
    'CAMPFIRE_TALISMAN_21'
  ],
  // Parallel "Soul" variant of the campfire badge line (Crimson Isle) —
  // not in the upstream SkyCrypt list this was ported from, added after
  // hitting it as a real false-"missing" bug. Verified against a live
  // resources/skyblock/items fetch: same 1/4/8/13/21 milestone structure.
  [
    'SOUL_CAMPFIRE_TALISMAN_1',
    'SOUL_CAMPFIRE_TALISMAN_4',
    'SOUL_CAMPFIRE_TALISMAN_8',
    'SOUL_CAMPFIRE_TALISMAN_13',
    'SOUL_CAMPFIRE_TALISMAN_21'
  ],
  ['JERRY_TALISMAN_GREEN', 'JERRY_TALISMAN_BLUE', 'JERRY_TALISMAN_PURPLE', 'JERRY_TALISMAN_GOLDEN'],
  ['TITANIUM_TALISMAN', 'TITANIUM_RING', 'TITANIUM_ARTIFACT', 'TITANIUM_RELIC'],
  ['BAIT_RING', 'SPIKED_ATROCITY'],
  [
    'MASTER_SKULL_TIER_1',
    'MASTER_SKULL_TIER_2',
    'MASTER_SKULL_TIER_3',
    'MASTER_SKULL_TIER_4',
    'MASTER_SKULL_TIER_5',
    'MASTER_SKULL_TIER_6',
    'MASTER_SKULL_TIER_7'
  ],
  ['SOULFLOW_PILE', 'SOULFLOW_BATTERY', 'SOULFLOW_SUPERCELL'],
  ['ENDER_ARTIFACT', 'ENDER_RELIC'],
  ['POWER_TALISMAN', 'POWER_RING', 'POWER_ARTIFACT', 'POWER_RELIC'],
  ['BINGO_TALISMAN', 'BINGO_RING', 'BINGO_ARTIFACT', 'BINGO_RELIC'],
  ['BURSTSTOPPER_TALISMAN', 'BURSTSTOPPER_ARTIFACT'],
  ['ODGERS_BRONZE_TOOTH', 'ODGERS_SILVER_TOOTH', 'ODGERS_GOLD_TOOTH', 'ODGERS_DIAMOND_TOOTH'],
  ['GREAT_SPOOK_TALISMAN', 'GREAT_SPOOK_RING', 'GREAT_SPOOK_ARTIFACT'],
  ['DRACONIC_TALISMAN', 'DRACONIC_RING', 'DRACONIC_ARTIFACT'],
  ['BURNING_KUUDRA_CORE', 'FIERY_KUUDRA_CORE', 'INFERNAL_KUUDRA_CORE'],
  ['VACCINE_TALISMAN', 'VACCINE_RING', 'VACCINE_ARTIFACT'],
  [
    'WHITE_GIFT_TALISMAN',
    'GREEN_GIFT_TALISMAN',
    'BLUE_GIFT_TALISMAN',
    'PURPLE_GIFT_TALISMAN',
    'GOLD_GIFT_TALISMAN'
  ],
  ['GLACIAL_TALISMAN', 'GLACIAL_RING', 'GLACIAL_ARTIFACT'],
  ['CROPIE_TALISMAN', 'SQUASH_RING', 'FERMENTO_ARTIFACT'],
  ['KUUDRA_FOLLOWER_ARTIFACT', 'KUUDRA_FOLLOWER_RELIC'],
  ['AGARIMOO_TALISMAN', 'AGARIMOO_RING', 'AGARIMOO_ARTIFACT'],
  ['BLOOD_DONOR_TALISMAN', 'BLOOD_DONOR_RING', 'BLOOD_DONOR_ARTIFACT'],
  ['LUSH_TALISMAN', 'LUSH_RING', 'LUSH_ARTIFACT'],
  ['ANITA_TALISMAN', 'ANITA_RING', 'ANITA_ARTIFACT'],
  ['PESTHUNTER_BADGE', 'PESTHUNTER_RING', 'PESTHUNTER_ARTIFACT', 'PESTHUNTER_RELIC'],
  [
    'NIBBLE_CHOCOLATE_STICK',
    'SMOOTH_CHOCOLATE_BAR',
    'RICH_CHOCOLATE_CHUNK',
    'GANACHE_CHOCOLATE_SLAB',
    'PRESTIGE_CHOCOLATE_REALM'
  ],
  ['COIN_TALISMAN', 'RING_OF_COINS', 'ARTIFACT_OF_COINS', 'RELIC_OF_COINS'],
  ['SCAVENGER_TALISMAN', 'SCAVENGER_RING', 'SCAVENGER_ARTIFACT'],
  ['EMERALD_RING', 'EMERALD_ARTIFACT'],
  ['MINERAL_TALISMAN', 'GLOSSY_MINERAL_TALISMAN'],
  ['HASTE_RING', 'HASTE_ARTIFACT'],
  // Not in the upstream list this was ported from — verified against
  // hypixelskyblock.minecraft.wiki's per-item crafting recipes (each
  // higher tier's recipe consumes 1x the tier below) rather than assumed
  // from naming alone, since none of these four share an id-suffix
  // pattern the auto-detector would have caught on its own.
  ['SMALL_FISH_BOWL', 'MEDIUM_FISH_BOWL', 'LARGE_FISH_BOWL'],
  ['DAY_CRYSTAL', 'SUNSHINE_CRYSTAL'],
  ['NIGHT_CRYSTAL', 'MOONLIGHT_CRYSTAL'],
  ['FROZEN_CHICKEN', 'FRIED_FROZEN_CHICKEN'],
  // Suffix doesn't match TIER_WORD_PATTERN (_VIP/_ELITE/_SUPREME, not one
  // of the TALISMAN/RING/ARTIFACT/RELIC/HEIRLOOM words), so the
  // auto-detector can't catch this one either — verified via the wiki's
  // per-item "Upgrades" section.
  ['VOTER_BADGE', 'VOTER_BADGE_VIP', 'VOTER_BADGE_ELITE', 'VOTER_BADGE_SUPREME']
]

/** Event-locked, unobtainable, or otherwise not meaningfully "missing" for a player to chase. */
export const IGNORED_ACCESSORIES = new Set([
  'BINGO_HEIRLOOM',
  'LUCK_TALISMAN',
  'TALISMAN_OF_SPACE',
  'RING_OF_SPACE',
  'MASTER_SKULL_TIER_8',
  'MASTER_SKULL_TIER_9',
  'MASTER_SKULL_TIER_10',
  'COMPASS_TALISMAN',
  'ARTIFACT_OF_SPACE',
  'GRIZZLY_PAW',
  'ETERNAL_CRYSTAL',
  'OLD_BOOT',
  'ARGOFAY_TRINKET',
  'DEFECTIVE_MONITOR',
  'PUNCHCARD_ARTIFACT',
  'HARMONIOUS_SURGERY_TOOLKIT',
  'CRUX_TALISMAN_1',
  'CRUX_TALISMAN_2',
  'CRUX_TALISMAN_3',
  'CRUX_TALISMAN_4',
  'CRUX_TALISMAN_5',
  'CRUX_TALISMAN_6',
  // Not in the upstream list this was ported from — verified via a live
  // items fetch that it's a real ACCESSORY-category id ("Celestial
  // Starstone") continuing the same Rift-exclusive Crux Talisman line as
  // the tiers above, so it belongs with them for the same reason.
  'CRUX_TALISMAN_7',
  'WARDING_TRINKET',
  'RING_OF_BROKEN_LOVE',
  'GARLIC_FLAVORED_GUMMY_BEAR',
  'GENERAL_MEDALLION',
  // Also missed from the upstream list — same Rift-exclusive category as
  // the other RIFT-origin entries above (verified via live items fetch:
  // origin "RIFT", craftable, Mountaintop-only "Bullet Time" ability).
  'SATELITE'
])

/** Cosmetic/functional duplicates — owning the alias counts as owning the key id. */
export const ACCESSORY_ALIASES: Record<string, string[]> = {
  WEDDING_RING_0: ['WEDDING_RING_1'],
  WEDDING_RING_2: ['WEDDING_RING_3'],
  WEDDING_RING_4: ['WEDDING_RING_5', 'WEDDING_RING_6'],
  WEDDING_RING_7: ['WEDDING_RING_8'],
  CAMPFIRE_TALISMAN_1: ['CAMPFIRE_TALISMAN_2', 'CAMPFIRE_TALISMAN_3'],
  CAMPFIRE_TALISMAN_4: ['CAMPFIRE_TALISMAN_5', 'CAMPFIRE_TALISMAN_6', 'CAMPFIRE_TALISMAN_7'],
  CAMPFIRE_TALISMAN_8: [
    'CAMPFIRE_TALISMAN_9',
    'CAMPFIRE_TALISMAN_10',
    'CAMPFIRE_TALISMAN_11',
    'CAMPFIRE_TALISMAN_12'
  ],
  CAMPFIRE_TALISMAN_13: [
    'CAMPFIRE_TALISMAN_14',
    'CAMPFIRE_TALISMAN_15',
    'CAMPFIRE_TALISMAN_16',
    'CAMPFIRE_TALISMAN_17',
    'CAMPFIRE_TALISMAN_18',
    'CAMPFIRE_TALISMAN_19',
    'CAMPFIRE_TALISMAN_20'
  ],
  CAMPFIRE_TALISMAN_21: [
    'CAMPFIRE_TALISMAN_22',
    'CAMPFIRE_TALISMAN_23',
    'CAMPFIRE_TALISMAN_24',
    'CAMPFIRE_TALISMAN_25',
    'CAMPFIRE_TALISMAN_26',
    'CAMPFIRE_TALISMAN_27',
    'CAMPFIRE_TALISMAN_28',
    'CAMPFIRE_TALISMAN_29'
  ],
  SOUL_CAMPFIRE_TALISMAN_1: ['SOUL_CAMPFIRE_TALISMAN_2', 'SOUL_CAMPFIRE_TALISMAN_3'],
  SOUL_CAMPFIRE_TALISMAN_4: [
    'SOUL_CAMPFIRE_TALISMAN_5',
    'SOUL_CAMPFIRE_TALISMAN_6',
    'SOUL_CAMPFIRE_TALISMAN_7'
  ],
  SOUL_CAMPFIRE_TALISMAN_8: [
    'SOUL_CAMPFIRE_TALISMAN_9',
    'SOUL_CAMPFIRE_TALISMAN_10',
    'SOUL_CAMPFIRE_TALISMAN_11',
    'SOUL_CAMPFIRE_TALISMAN_12'
  ],
  SOUL_CAMPFIRE_TALISMAN_13: [
    'SOUL_CAMPFIRE_TALISMAN_14',
    'SOUL_CAMPFIRE_TALISMAN_15',
    'SOUL_CAMPFIRE_TALISMAN_16',
    'SOUL_CAMPFIRE_TALISMAN_17',
    'SOUL_CAMPFIRE_TALISMAN_18',
    'SOUL_CAMPFIRE_TALISMAN_19',
    'SOUL_CAMPFIRE_TALISMAN_20'
  ],
  SOUL_CAMPFIRE_TALISMAN_21: [
    'SOUL_CAMPFIRE_TALISMAN_22',
    'SOUL_CAMPFIRE_TALISMAN_23',
    'SOUL_CAMPFIRE_TALISMAN_24',
    'SOUL_CAMPFIRE_TALISMAN_25',
    'SOUL_CAMPFIRE_TALISMAN_26',
    'SOUL_CAMPFIRE_TALISMAN_27',
    'SOUL_CAMPFIRE_TALISMAN_28',
    'SOUL_CAMPFIRE_TALISMAN_29'
  ],
  PARTY_HAT_CRAB: ['PARTY_HAT_CRAB_ANIMATED', 'PARTY_HAT_SLOTH', 'BALLOON_HAT_2024'],
  PIGGY_BANK: ['BROKEN_PIGGY_BANK', 'CRACKED_PIGGY_BANK'],
  DANTE_TALISMAN: ['DANTE_RING']
}

export function getUpgradeChain(id: string): string[] | undefined {
  return ACCESSORY_UPGRADES.find((chain) => chain.includes(id))
}

/** Resolves an alias id to the canonical id it should count as ownership of, if it is one. */
export function resolveAlias(id: string): string {
  for (const [canonical, aliases] of Object.entries(ACCESSORY_ALIASES)) {
    if (aliases.includes(id)) return canonical
  }
  return id
}

/**
 * Magical Power granted per accessory rarity — ported from SkyCrypt's
 * `MAGICAL_POWER` table (`src/constants/accessories.js`), which is itself
 * the reference value every "coins per MP" calculator (including the
 * SkyHelper Discord bot's `/missing` command this MP Calculator tool
 * clones) is built on. `divine`/`supreme`/`admin` never occur on a real
 * accessory and are intentionally absent (treated as 0 below).
 */
export const MAGICAL_POWER: Partial<Record<Rarity, number>> = {
  common: 3,
  uncommon: 5,
  rare: 8,
  epic: 12,
  legendary: 16,
  mythic: 22,
  special: 3,
  very_special: 5
}

/** Ascending rarity ladder Recombobulator 3000 climbs one rung at a time. */
export const RARITY_LADDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic']

/**
 * Magical Power a given accessory contributes — almost always just
 * `MAGICAL_POWER[rarity]`, except two ids with a hardcoded override
 * (verified against SkyCrypt's `getMagicalPower` in `src/helper.js`):
 * Hegemony Artifact counts double, and Rift Prism grants a flat 11
 * regardless of its (non-standard) rarity.
 */
export function getMagicalPower(rarity: Rarity | null, itemId?: string | null): number {
  if (!rarity) return 0
  if (itemId === 'HEGEMONY_ARTIFACT') return 2 * (MAGICAL_POWER[rarity] ?? 0)
  if (itemId === 'RIFT_PRISM') return 11
  return MAGICAL_POWER[rarity] ?? 0
}

/** Ids whose rarity the Recombobulator 3000 can't be applied to (verified via SkyCrypt's `allowsRecomb: false`). */
export const RECOMB_INELIGIBLE_IDS = new Set(['RIFT_PRISM', 'PANDORAS_BOX', 'BOOK_OF_PROGRESSION'])

/**
 * Multi-rarity "custom price" accessories — a single item id purchasable/
 * craftable at several different rarities (each its own real cost), rather
 * than the usual one-id-one-rarity accessory. Ported from SkyCrypt's
 * `SPECIAL_ACCESSORIES` table (`src/constants/accessories.js`).
 */
export const SPECIAL_ACCESSORY_RARITIES: Record<string, Rarity[]> = {
  BOOK_OF_PROGRESSION: ['uncommon', 'rare', 'epic', 'legendary', 'mythic'],
  PANDORAS_BOX: ['uncommon', 'rare', 'epic', 'legendary', 'mythic'],
  TRAPPER_CREST: ['uncommon'],
  PULSE_RING: ['rare', 'epic', 'legendary'],
  POWER_ARTIFACT: ['epic']
}

/**
 * Pulse Ring's price at each rarity isn't its own AH/bazaar listing — it's
 * crafted from this many Thunder in a Bottle. Ported from SkyCrypt's
 * `SPECIAL_ACCESSORIES.PULSE_RING.upgrade.cost`.
 */
export const PULSE_RING_UPGRADE_COST: Partial<Record<Rarity, number>> = {
  rare: 3,
  epic: 20,
  legendary: 100
}
