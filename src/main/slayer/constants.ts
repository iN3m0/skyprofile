/**
 * Slayer leveling/identity data — stable, long-standing game structure
 * (unlike Bestiary/Attributes, this hasn't needed a live/ported source;
 * the six bosses and their XP curves have been unchanged for years), so
 * hand-transcribed directly from NEU-REPO's `constants/leveling.json`
 * (MIT-licensed) rather than needing the wiki-scrape treatment those did.
 * Values are *cumulative* XP required to reach each level (same
 * convention as this app's skill-leveling tables) — verified against a
 * live profile: a Zombie slayer with 1,001,542 XP sits just past the
 * final 1,000,000 threshold, i.e. maxed, exactly as expected.
 */
export const SLAYER_XP_THRESHOLDS: Record<string, number[]> = {
  zombie: [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  spider: [5, 15, 200, 1000, 5000, 20000, 100000, 400000, 1000000],
  wolf: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  enderman: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  blaze: [10, 30, 250, 1500, 5000, 20000, 100000, 400000, 1000000],
  vampire: [20, 75, 240, 840, 2400]
}

export const SLAYER_FANCY_NAMES: Record<string, string> = {
  zombie: 'Revenant Horror',
  spider: 'Tarantula Broodfather',
  wolf: 'Sven Packmaster',
  enderman: 'Voidgloom Seraph',
  blaze: 'Inferno Demonlord',
  vampire: 'Riftstalker Bloodfiend'
}

/** Highest fightable tier per slayer — separate axis from XP level (this caps at 4 or 5 depending on type; XP level caps at 9, or 5 for Vampire, per SLAYER_XP_THRESHOLDS). */
export const SLAYER_MAX_TIER: Record<string, number> = {
  zombie: 5,
  spider: 5,
  wolf: 4,
  enderman: 4,
  blaze: 4,
  vampire: 5
}

/** Display order — matches the order the in-game Slayer menu lists these in. */
export const SLAYER_ORDER = ['zombie', 'spider', 'wolf', 'enderman', 'blaze', 'vampire']
