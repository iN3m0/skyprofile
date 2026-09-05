/**
 * Maps a Hypixel collection entry's raw `id` (e.g. "WHEAT", "LOG:1",
 * "INK_SACK:3") to a small icon bundled at `public/items/<name>.png`.
 *
 * The icons themselves are vanilla Minecraft item/block textures (16x16),
 * sourced via PrismarineJS's `minecraft-assets` package (MIT-licensed
 * tooling; the extracted textures are Mojang's game assets, used here the
 * same way SkyCrypt and most Skyblock tools do — as small reference icons
 * in a personal/local tool, not redistributed as a standalone asset pack).
 *
 * Hypixel's collection IDs are Minecraft's *legacy* pre-1.13 item/block
 * IDs, several with a `:damage` suffix for what used to be one item with
 * many color/type variants (e.g. INK_SACK was the dye item — damage 3 is
 * cocoa beans, 4 is lapis lazuli; LOG/LOG_2 are the 6 vanilla wood types).
 * Verified against a live `resources/skyblock/collections` response
 * rather than assumed from memory.
 *
 * Anything without a real vanilla equivalent (custom Skyblock-only crops,
 * ores, and all Rift collection items) has no entry here — callers should
 * fall back to a generic placeholder rather than a broken image.
 */
const COLLECTION_ITEM_ICONS: Record<string, string> = {
  // Farming
  WHEAT: 'wheat',
  CARROT_ITEM: 'carrot',
  POTATO_ITEM: 'potato',
  PUMPKIN: 'pumpkin',
  MELON: 'melon_slice',
  SUGAR_CANE: 'sugar_cane',
  SEEDS: 'wheat_seeds',
  NETHER_STALK: 'nether_wart',
  RAW_CHICKEN: 'chicken',
  MUTTON: 'mutton',
  PORK: 'porkchop',
  RABBIT: 'rabbit',
  LEATHER: 'leather',
  FEATHER: 'feather',
  'INK_SACK:3': 'cocoa_beans',
  DOUBLE_PLANT: 'sunflower',
  CACTUS: 'cactus',
  MUSHROOM_COLLECTION: 'mushroom',

  // Mining
  'INK_SACK:4': 'lapis_lazuli',
  REDSTONE: 'redstone',
  COAL: 'coal',
  MYCEL: 'mycelium',
  ENDER_STONE: 'end_stone',
  QUARTZ: 'quartz',
  SAND: 'sand',
  'SAND:1': 'red_sand',
  IRON_INGOT: 'iron_ingot',
  OBSIDIAN: 'obsidian',
  DIAMOND: 'diamond',
  COBBLESTONE: 'cobblestone',
  GLOWSTONE_DUST: 'glowstone_dust',
  GOLD_INGOT: 'gold_ingot',
  GRAVEL: 'gravel',
  EMERALD: 'emerald',
  ICE: 'ice',
  NETHERRACK: 'netherrack',

  // Combat
  ENDER_PEARL: 'ender_pearl',
  SLIME_BALL: 'slime_ball',
  MAGMA_CREAM: 'magma_cream',
  GHAST_TEAR: 'ghast_tear',
  SULPHUR: 'gunpowder',
  ROTTEN_FLESH: 'rotten_flesh',
  SPIDER_EYE: 'spider_eye',
  BONE: 'bone',
  BLAZE_ROD: 'blaze_rod',
  STRING: 'string',

  // Foraging
  LOG: 'oak_log',
  'LOG:1': 'spruce_log',
  'LOG:2': 'birch_log',
  'LOG:3': 'jungle_log',
  LOG_2: 'acacia_log',
  'LOG_2:1': 'dark_oak_log',
  MANGROVE_LOG: 'mangrove_log',
  HONEYCOMB: 'honeycomb',

  // Fishing
  WATER_LILY: 'lily_pad',
  PRISMARINE_SHARD: 'prismarine_shard',
  INK_SACK: 'ink_sac',
  RAW_FISH: 'cod',
  'RAW_FISH:1': 'salmon',
  'RAW_FISH:2': 'tropical_fish',
  'RAW_FISH:3': 'pufferfish',
  PRISMARINE_CRYSTALS: 'prismarine_crystals',
  CLAY_BALL: 'clay_ball',
  SPONGE: 'sponge',

  // Custom Skyblock-only items with no real vanilla item, but whose
  // Hypixel `material` field (from a live `resources/skyblock/items`
  // check) is a real vanilla material close enough to reuse as an icon —
  // an approximation, not the item's actual custom texture.
  MITHRIL_ORE: 'prismarine_crystals',
  HARD_STONE: 'stone',
  GLACITE: 'packed_ice',
  SULPHUR_ORE: 'glowstone_dust',
  WILTED_BERBERIS: 'dead_bush',
  HALF_EATEN_CARROT: 'carrot',
  HEMOVIBE: 'redstone_ore',
  MOONFLOWER: 'poppy'
}

// Eagerly imported so Vite processes these through its normal asset
// pipeline (hashed, correctly-resolved URLs in both dev and the packaged
// build) rather than a hand-written `/items/...` path, which would break
// once the app loads over `file://` instead of a dev server.
//
// `assets/items` is the full vanilla item-sprite set (~800 files, direct
// name match against minecraft-data's item names — see decodeItems.ts on
// the main side, which resolves each inventory item's legacy numeric NBT
// id to one of these names). `assets/blocks` is a secondary fallback for
// materials that are only a block (ore blocks, wool, etc., matched by
// their single flat texture file where one exists — multi-face blocks
// like grass or logs won't match by plain name and that's fine, it's a
// small remaining gap).
function loadIcons(glob: Record<string, string>, prefix: string): Record<string, string> {
  return Object.fromEntries(Object.entries(glob).map(([path, url]) => [path.replace(prefix, '').replace('.png', ''), url]))
}

const ICON_URLS = loadIcons(
  import.meta.glob('../assets/items/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
    string,
    string
  >,
  '../assets/items/'
)

const BLOCK_ICON_URLS = loadIcons(
  import.meta.glob('../assets/blocks/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
    string,
    string
  >,
  '../assets/blocks/'
)

export function getItemIconUrl(id: string): string | null {
  const name = COLLECTION_ITEM_ICONS[id]
  if (!name) return null
  return ICON_URLS[name] ?? null
}

/**
 * `minecraft-data` gives 1.8.9-era legacy names — most match our modern
 * (1.21.11) texture filenames directly, but some don't: either the item
 * was renamed since ("golden_rail" → "powered_rail"), or the legacy name
 * has no single icon of its own because it needs a default variant picked
 * ("wool" needs a color, "log" needs a wood species — Hypixel's items
 * rarely care which, so any reasonable default works for an icon), or the
 * shape is a block variant (stairs/slabs/fences/walls/etc.) that reuses
 * its base material's texture rather than having a unique one. Verified
 * against the actual bundled file list, not guessed.
 */
const VANILLA_ALIASES: Record<string, string> = {
  grass: 'grass_block_top',
  planks: 'oak_planks',
  sapling: 'oak_sapling',
  log: 'oak_log',
  leaves: 'oak_leaves',
  dispenser: 'dispenser_front',
  noteblock: 'note_block',
  golden_rail: 'powered_rail',
  sticky_piston: 'piston_top_sticky',
  web: 'cobweb',
  tallgrass: 'short_grass',
  deadbush: 'dead_bush',
  piston: 'piston_top',
  wool: 'white_wool',
  yellow_flower: 'dandelion',
  red_flower: 'poppy',
  stone_slab: 'smooth_stone_slab_side',
  brick_block: 'bricks',
  tnt: 'tnt_side',
  mob_spawner: 'spawner',
  oak_stairs: 'oak_planks',
  chest: 'oak_planks',
  crafting_table: 'crafting_table_top',
  furnace: 'furnace_front',
  stone_stairs: 'cobblestone',
  stone_pressure_plate: 'stone',
  wooden_pressure_plate: 'oak_planks',
  stone_button: 'stone',
  snow_layer: 'snow',
  jukebox: 'jukebox_top',
  fence: 'oak_planks',
  lit_pumpkin: 'pumpkin_side',
  stained_glass: 'white_stained_glass',
  trapdoor: 'oak_planks',
  monster_egg: 'stone',
  stonebrick: 'stone_bricks',
  glass_pane: 'glass',
  melon_block: 'melon_side',
  fence_gate: 'oak_planks',
  brick_stairs: 'bricks',
  stone_brick_stairs: 'stone_bricks',
  waterlily: 'lily_pad',
  nether_brick_fence: 'nether_bricks',
  nether_brick_stairs: 'nether_bricks',
  enchanting_table: 'enchanting_table_top',
  end_portal_frame: 'end_portal_frame_top',
  wooden_slab: 'oak_planks',
  sandstone_stairs: 'sandstone',
  ender_chest: 'obsidian',
  spruce_stairs: 'spruce_planks',
  birch_stairs: 'birch_planks',
  jungle_stairs: 'jungle_planks',
  command_block: 'command_block_front',
  cobblestone_wall: 'cobblestone',
  wooden_button: 'oak_planks',
  trapped_chest: 'oak_planks',
  light_weighted_pressure_plate: 'gold_block',
  heavy_weighted_pressure_plate: 'iron_block',
  daylight_detector: 'daylight_detector_top',
  quartz_ore: 'nether_quartz_ore',
  quartz_block: 'quartz_block_side',
  quartz_stairs: 'quartz_block_side',
  dropper: 'dropper_front',
  stained_hardened_clay: 'white_terracotta',
  stained_glass_pane: 'white_stained_glass',
  leaves2: 'acacia_leaves',
  log2: 'acacia_log',
  acacia_stairs: 'acacia_planks',
  dark_oak_stairs: 'dark_oak_planks',
  slime: 'slime_block',
  hay_block: 'hay_block_side',
  carpet: 'white_wool',
  hardened_clay: 'terracotta',
  double_plant: 'sunflower_front',
  red_sandstone_stairs: 'red_sandstone',
  stone_slab2: 'red_sandstone',
  spruce_fence_gate: 'spruce_planks',
  birch_fence_gate: 'birch_planks',
  jungle_fence_gate: 'jungle_planks',
  dark_oak_fence_gate: 'dark_oak_planks',
  acacia_fence_gate: 'acacia_planks',
  spruce_fence: 'spruce_planks',
  birch_fence: 'birch_planks',
  jungle_fence: 'jungle_planks',
  dark_oak_fence: 'dark_oak_planks',
  acacia_fence: 'acacia_planks',
  sign: 'oak_planks',
  wooden_door: 'oak_door_top',
  boat: 'oak_planks',
  reeds: 'sugar_cane',
  compass: 'compass_00',
  clock: 'clock_00',
  fish: 'cod',
  cooked_fish: 'cooked_cod',
  dye: 'ink_sac',
  bed: 'red_wool',
  melon: 'melon_slice',
  speckled_melon: 'glistering_melon_slice',
  spawn_egg: 'egg',
  fireworks: 'firework_rocket',
  firework_charge: 'firework_star',
  netherbrick: 'nether_brick',
  record_13: 'music_disc_13',
  record_cat: 'music_disc_cat',
  record_blocks: 'music_disc_blocks',
  record_chirp: 'music_disc_chirp',
  record_far: 'music_disc_far',
  record_mall: 'music_disc_mall',
  record_mellohi: 'music_disc_mellohi',
  record_stal: 'music_disc_stal',
  record_strad: 'music_disc_strad',
  record_ward: 'music_disc_ward',
  record_11: 'music_disc_11',
  record_wait: 'music_disc_wait'
  // "skull" and "banner" are intentionally absent — both are 3D
  // entity-rendered in modern Minecraft with no flat texture at all, so
  // there's genuinely nothing to alias to. Rare as a bare material
  // without its own custom skin/pattern, so left to the placeholder.
}

// Hypixel's own placeholder material for custom items it never bothered
// giving a real vanilla look — showing the literal paper texture reads as
// "this is a sheet of paper", which is more misleading than our honest
// colored-dot placeholder. Excluded here so those items fall through to
// the Hypixel+ art (usually available for exactly these custom items) or
// the placeholder, never the literal paper icon.
const GENERIC_PLACEHOLDER_MATERIALS = new Set(['paper'])

/** Resolves a vanilla item/block name (from minecraft-data) to a bundled icon, item sprites preferred over block textures. */
export function getVanillaIconUrl(vanillaId: string | null): string | null {
  if (!vanillaId || GENERIC_PLACEHOLDER_MATERIALS.has(vanillaId)) return null
  const aliased = VANILLA_ALIASES[vanillaId]
  return ICON_URLS[vanillaId] ?? BLOCK_ICON_URLS[vanillaId] ?? (aliased && (ICON_URLS[aliased] ?? BLOCK_ICON_URLS[aliased])) ?? null
}

// See src/renderer/src/assets/hplus/README.md for what this is and why it
// exists — the developer's own personal copy of the Hypixel+ resource
// pack, used for this one local app, not redistributed as a standalone
// asset pack. manifest.json maps a *guessed* Hypixel item id to a
// filename (verified against several known real ids, not exhaustively).
import hplusManifest from '../assets/hplus/manifest.json'

const HPLUS_URLS = loadIcons(
  import.meta.glob('../assets/hplus/*.png', { eager: true, query: '?url', import: 'default' }) as Record<
    string,
    string
  >,
  '../assets/hplus/'
)

/**
 * Resolves a Skyblock item id to a Hypixel+ icon, trying the id as-is and
 * then with a "_1" suffix — many accessory families are tiered
 * (CAMPFIRE_TALISMAN_2..5) but the pack's first tier is often filed under
 * "..._1" even when Hypixel's own id for that tier has no suffix.
 */
export function getHplusIconUrl(itemId: string | null): string | null {
  if (!itemId) return null
  const manifest = hplusManifest as Record<string, string>
  const filename = manifest[itemId] ?? manifest[`${itemId}_1`]
  return filename ? (HPLUS_URLS[filename] ?? null) : null
}
