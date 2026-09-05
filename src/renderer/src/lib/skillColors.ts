/**
 * One hand-picked "colored pencil" hue per skill, reused for the matching
 * collection category (Hypixel's collection category keys line up with
 * skill names, e.g. FARMING/MINING/COMBAT) so the same subject reads the
 * same color across tabs. Deliberately not a generated/interpolated
 * palette — each was picked to loosely fit the skill (green for farming,
 * stone-blue for mining, red for combat, ...).
 */
const SKILL_COLORS: Record<string, string> = {
  farming: '#8bc34a',
  mining: '#7e97a8',
  combat: '#e05a5a',
  foraging: '#a9714b',
  fishing: '#4fa3d1',
  enchanting: '#a56de2',
  alchemy: '#e07fc0',
  taming: '#e8a33d',
  carpentry: '#c9a15a',
  runecrafting: '#3fc7b0',
  social: '#e8d24d',
  rift: '#7c6ce0'
}

const FALLBACK_COLOR = '#5cc3d4'

export function getSkillColor(key: string): string {
  return SKILL_COLORS[key.toLowerCase()] ?? FALLBACK_COLOR
}

/** A handful of marker-pen colors for cycling through card outlines. */
export const MARKER_COLORS = ['#e8a33d', '#4fa3d1', '#8bc34a', '#e07fc0', '#a56de2', '#e05a5a']
