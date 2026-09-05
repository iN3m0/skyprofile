/**
 * Minion-slot progression table — how many unique minions (every distinct
 * "type+tier" ever crafted, per Hypixel's own wording: "creating new
 * unique minion types or a higher level minion of the same type that has
 * already been collected") unlock each additional slot. Transcribed
 * directly from the current wiki table (fetched live while implementing
 * this, not from an archived/possibly-stale source), one row per tier:
 * https://hypixelskyblock.minecraft.wiki/w/Minions#Crafted_Minion_Slots
 */
export const CRAFTED_MINION_SLOT_TIERS: { uniqueRequired: number; slots: number }[] = [
  { uniqueRequired: 0, slots: 5 },
  { uniqueRequired: 5, slots: 6 },
  { uniqueRequired: 15, slots: 7 },
  { uniqueRequired: 30, slots: 8 },
  { uniqueRequired: 50, slots: 9 },
  { uniqueRequired: 75, slots: 10 },
  { uniqueRequired: 100, slots: 11 },
  { uniqueRequired: 125, slots: 12 },
  { uniqueRequired: 150, slots: 13 },
  { uniqueRequired: 175, slots: 14 },
  { uniqueRequired: 200, slots: 15 },
  { uniqueRequired: 225, slots: 16 },
  { uniqueRequired: 250, slots: 17 },
  { uniqueRequired: 275, slots: 18 },
  { uniqueRequired: 300, slots: 19 },
  { uniqueRequired: 350, slots: 20 },
  { uniqueRequired: 400, slots: 21 },
  { uniqueRequired: 450, slots: 22 },
  { uniqueRequired: 500, slots: 23 },
  { uniqueRequired: 550, slots: 24 },
  { uniqueRequired: 600, slots: 25 },
  { uniqueRequired: 650, slots: 26 },
  { uniqueRequired: 700, slots: 27 }
]

/** The Community Shop's "Minion Slots" profile upgrade — up to 5 tiers, +1 slot each, entirely separate from the crafted-slots table above. */
export const MAX_BONUS_MINION_SLOT_TIERS = 5

/**
 * Minion type → skill category, for grouping the tab's long list the same
 * way Bestiary groups by category. Hand-mapped from general knowledge of
 * Hypixel's own Community Center/collection groupings (this is stable,
 * long-standing game structure, not the kind of fast-changing data that
 * needed a live/ported source elsewhere in this app) — any type not in
 * this map (a newer minion added after this was written) falls back to
 * "Other" in minionService.ts rather than being dropped.
 */
export const MINION_CATEGORIES: Record<string, string> = {
  COBBLESTONE: 'Mining',
  COAL: 'Mining',
  IRON: 'Mining',
  GOLD: 'Mining',
  DIAMOND: 'Mining',
  LAPIS: 'Mining',
  REDSTONE: 'Mining',
  EMERALD: 'Mining',
  QUARTZ: 'Mining',
  OBSIDIAN: 'Mining',
  GLOWSTONE: 'Mining',
  GRAVEL: 'Mining',
  SAND: 'Mining',
  ICE: 'Mining',
  SNOW: 'Mining',
  MITHRIL: 'Mining',
  HARD_STONE: 'Mining',
  RED_SAND: 'Mining',
  ENDER_STONE: 'Mining',
  MYCELIUM: 'Mining',
  CLAY: 'Mining',

  WHEAT: 'Farming',
  CARROT: 'Farming',
  POTATO: 'Farming',
  PUMPKIN: 'Farming',
  MELON: 'Farming',
  MUSHROOM: 'Farming',
  COCOA: 'Farming',
  NETHER_WARTS: 'Farming',
  CHICKEN: 'Farming',
  COW: 'Farming',
  PIG: 'Farming',
  RABBIT: 'Farming',
  SHEEP: 'Farming',
  SUGAR_CANE: 'Farming',
  FLOWER: 'Farming',
  SUNFLOWER: 'Farming',
  CACTUS: 'Farming',

  OAK: 'Foraging',
  SPRUCE: 'Foraging',
  BIRCH: 'Foraging',
  DARK_OAK: 'Foraging',
  ACACIA: 'Foraging',
  JUNGLE: 'Foraging',

  ZOMBIE: 'Combat',
  SKELETON: 'Combat',
  SPIDER: 'Combat',
  CAVESPIDER: 'Combat',
  CREEPER: 'Combat',
  ENDERMAN: 'Combat',
  GHAST: 'Combat',
  SLIME: 'Combat',
  MAGMA_CUBE: 'Combat',
  BLAZE: 'Combat',
  REVENANT: 'Combat',
  TARANTULA: 'Combat',
  VOIDLING: 'Combat',
  INFERNO: 'Combat',
  VAMPIRE: 'Combat',

  FISHING: 'Fishing',
  LILY_PAD: 'Fishing'
}

export function getMinionCategory(type: string): string {
  return MINION_CATEGORIES[type] ?? 'Other'
}
