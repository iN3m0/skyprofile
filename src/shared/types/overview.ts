export interface SkyblockLevelInfo {
  level: number
  xp: number
  /** XP needed to reach the next level — always 100 minus however far into the current level, since SkyBlock Level costs a flat 100 XP per level. */
  xpForNextLevel: number
  /** 0–1 progress toward the next level. */
  progress: number
}

export interface NetworthCategory {
  key: string
  total: number
}

export interface NetworthInfo {
  total: number
  /** Networth excluding soulbound items (which can't be sold/traded, so arguably shouldn't count toward a "sellable" total). */
  unsoulboundTotal: number
  purse: number
  bank: number
  personalBank: number
  /** Non-zero categories only, sorted highest first. */
  categories: NetworthCategory[]
}

export interface PlayerOverviewSummary {
  skyblockLevel: SkyblockLevelInfo | null
  /** null if the networth calculation failed (e.g. inventory API disabled) — best-effort, not fatal to the rest of this summary. */
  networth: NetworthInfo | null
  /** Epoch ms — network-wide first login, not specific to this SkyBlock profile (Hypixel doesn't expose a per-profile join date). */
  firstJoined: number | null
  /** Epoch ms — network-wide last logout. */
  lastSeen: number | null
  /** Epoch ms this specific SkyBlock profile was created. */
  profileCreatedAt: number | null
}
