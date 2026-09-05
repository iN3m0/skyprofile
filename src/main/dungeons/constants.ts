/**
 * Catacombs/dungeon-class leveling data — stable, long-standing game
 * structure (same precedent as Slayer: no wiki-scraping
 * needed, just transcribed from NEU-REPO's `constants/leveling.json`,
 * MIT-licensed). All 5 dungeon classes (Healer/Mage/Berserk/Archer/Tank)
 * share this exact same curve with Catacombs itself — a well-known
 * Hypixel design choice, not an assumption.
 *
 * The source array is *incremental* (cost to go from level N-1 to N), and
 * keeps repeating a 200,000,000 filler value hundreds of times past
 * level 50 as a defensive long tail — real content stops at level 50, so
 * only the first 50 values are transcribed, then cumulatively summed here
 * into the actual XP-to-reach-this-level thresholds this app's leveling
 * helpers expect (same convention as skills/pets/slayer elsewhere).
 * Verified against a live profile: 611,196.9 Catacombs XP lands at
 * exactly level 24 against this table, a sane mid-progression result.
 */
const CATACOMBS_LEVEL_COSTS = [
  50, 75, 110, 160, 230, 330, 470, 670, 950, 1340, 1890, 2665, 3760, 5260, 7380, 10300, 14400, 20000, 27600, 38000,
  52500, 71500, 97000, 132000, 180000, 243000, 328000, 445000, 600000, 800000, 1065000, 1410000, 1900000, 2500000,
  3300000, 4300000, 5600000, 7200000, 9200000, 12000000, 15000000, 19000000, 24000000, 30000000, 38000000, 48000000,
  60000000, 75000000, 93000000, 116250000
]

function cumulative(costs: number[]): number[] {
  let sum = 0
  return costs.map((cost) => (sum += cost))
}

export const CATACOMBS_XP_THRESHOLDS = cumulative(CATACOMBS_LEVEL_COSTS)
export const CATACOMBS_MAX_LEVEL = CATACOMBS_XP_THRESHOLDS.length

export const DUNGEON_CLASS_ORDER = ['healer', 'mage', 'berserk', 'archer', 'tank']

export function titleCase(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1)
}
