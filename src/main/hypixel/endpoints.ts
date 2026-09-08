/**
 * Central registry of Hypixel API paths used by the app. Kept separate from
 * client.ts so new endpoints (profiles, resources, bazaar, ...) added in
 * later milestones have one obvious place to land.
 */
export const HypixelPaths = {
  player: '/v2/player',
  skyblockProfiles: '/v2/skyblock/profiles',
  skyblockProfile: '/v2/skyblock/profile',
  // A separate top-level endpoint, not a field on the profile response —
  // one call returns every co-op member's museum data for the profile.
  skyblockMuseum: '/v2/skyblock/museum',
  resourceItems: '/v2/resources/skyblock/items',
  resourceSkills: '/v2/resources/skyblock/skills',
  resourceCollections: '/v2/resources/skyblock/collections',
  resourceBingo: '/v2/resources/skyblock/bingo',
  // Confirmed real (a live third-party site's production bundle calls this
  // exact path), but it's flaky — sometimes hangs with no response at all
  // rather than erroring, hence the request timeout in client.ts.
  resourceElection: '/v2/resources/skyblock/election',
  // Cheap authenticated endpoint used purely to validate that a key works —
  // Hypixel removed the old dedicated "/key" info endpoint, so any small
  // authenticated call doubles as a connectivity/validity check.
  punishmentStats: '/v2/punishmentstats'
} as const
